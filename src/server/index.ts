import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  SITE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ---------------------------------------------------------------------------
// Security posture
//
// 1. Input hardening
//    - Enforce Content-Type: application/json
//    - Cap the request body at 8 KiB (typical subscribe payload is ~1 KiB)
//    - Validate email via regex AND length (<=254 per RFC)
//    - Cap stack object to <= 32 keys with <= 64-char values
//
// 2. Abuse control
//    - Per-IP rate limit via an in-memory sliding window
//      (5 req / 60s). Cloudflare Workers instances are short-lived so this
//      leaks between isolates; it's a best-effort first line. Pair with
//      Cloudflare Rules / Turnstile for production-grade defence.
//
// 3. Transport
//    - Restrictive CORS allow-list sourced from SITE_URL
//    - Security headers on all responses (CSP, X-Frame-Options,
//      X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
// ---------------------------------------------------------------------------

const VALID_ACTIONS = new Set([
  'copy_prompt',
  'copy_stack_image',
  'download_png',
  'download_diagram',
  'reset',
])

const MAX_BODY_BYTES = 8 * 1024
const MAX_EMAIL_LEN = 254
const MAX_STACK_KEYS = 32
const MAX_VALUE_LEN = 64

// Sliding-window rate limiter (per-isolate, per-IP)
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 5
const rateStore = new Map<string, number[]>()

function rateLimitCheck(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = (rateStore.get(ip) ?? []).filter(ts => ts > windowStart)
  if (hits.length >= RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((hits[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) }
  }
  hits.push(now)
  rateStore.set(ip, hits)
  // Occasional GC — don't let the map grow unbounded
  if (rateStore.size > 5000) {
    for (const [k, v] of rateStore) {
      if (v[v.length - 1] < windowStart) rateStore.delete(k)
    }
  }
  return { ok: true, retryAfterSec: 0 }
}

// CORS — only the configured SITE_URL may call the API
app.use('/api/*', async (c, next) => {
  const origin = c.req.header('Origin') ?? ''
  const allowed = origin === c.env.SITE_URL
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowed ? origin : 'null',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  await next()
  if (allowed) c.res.headers.set('Access-Control-Allow-Origin', origin)
  c.res.headers.set('Vary', 'Origin')
})

// Security headers on every response
app.use('*', async (c, next) => {
  await next()
  const h = c.res.headers
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('X-Frame-Options', 'DENY')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  // Narrow CSP for HTML responses. JSON responses don't need this but it's harmless.
  if ((h.get('Content-Type') ?? '').startsWith('text/html')) {
    h.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        // Brand logos pulled via Clearbit, Google favicons, and Simple Icons CDN
        "img-src 'self' data: https://logo.clearbit.com https://www.google.com https://cdn.simpleicons.org",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    )
  }
})

app.get('/api/health', (c) => c.json({ ok: true }))

/** POST /api/subscribe — store email + stack snapshot, gate downloads */
app.post('/api/subscribe', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'
  const rl = rateLimitCheck(ip)
  if (!rl.ok) {
    return c.json(
      { error: 'Too many requests' },
      429,
      { 'Retry-After': String(rl.retryAfterSec) },
    )
  }

  const contentType = c.req.header('Content-Type') ?? ''
  if (!contentType.includes('application/json')) {
    return c.json({ error: 'Content-Type must be application/json' }, 415)
  }

  const contentLength = Number(c.req.header('Content-Length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return c.json({ error: 'Payload too large' }, 413)
  }

  const raw = await c.req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return c.json({ error: 'Payload too large' }, 413)
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { email, action, mode, stack } = (body ?? {}) as Record<string, unknown>

  if (
    typeof email !== 'string' ||
    email.length > MAX_EMAIL_LEN ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return c.json({ error: 'Invalid email' }, 400)
  }
  if (typeof action !== 'string' || !VALID_ACTIONS.has(action)) {
    return c.json({ error: 'Invalid action' }, 400)
  }
  if (mode !== 'app' && mode !== 'content') {
    return c.json({ error: 'Invalid mode' }, 400)
  }
  if (typeof stack !== 'object' || stack === null || Array.isArray(stack)) {
    return c.json({ error: 'Invalid stack' }, 400)
  }

  const stackEntries = Object.entries(stack as Record<string, unknown>)
  if (stackEntries.length > MAX_STACK_KEYS) {
    return c.json({ error: 'Invalid stack' }, 400)
  }
  for (const [k, v] of stackEntries) {
    if (k.length > MAX_VALUE_LEN) return c.json({ error: 'Invalid stack' }, 400)
    if (v != null && (typeof v !== 'string' || v.length > MAX_VALUE_LEN)) {
      return c.json({ error: 'Invalid stack' }, 400)
    }
  }

  const userAgent = (c.req.header('User-Agent') ?? '').slice(0, 256)

  try {
    await c.env.DB
      .prepare(
        'INSERT INTO subscribers (email, action, mode, stack_json, user_agent) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(email.toLowerCase(), action, mode, JSON.stringify(stack), userAgent || null)
      .run()
  } catch (err) {
    console.error('subscribe insert failed', err)
    return c.json({ error: 'Database error' }, 500)
  }

  return c.json({ ok: true })
})

app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404))

export default {
  fetch: app.fetch,
}
