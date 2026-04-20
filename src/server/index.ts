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
const MAX_DOMAIN_LENGTH = 253

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

// CORS + origin enforcement.
// Browsers are protected by CORS; non-browser clients (curl, bots) ignore it,
// so we also reject state-changing requests server-side when the Origin header
// is absent or not on the allow-list. Safe methods (GET/HEAD) are exempt so
// monitoring / healthchecks still work without an Origin.
app.use('/api/*', async (c, next) => {
  const origin = c.req.header('Origin') ?? ''
  const allowed = origin !== '' && origin === c.env.SITE_URL
  const method = c.req.method
  if (method === 'OPTIONS') {
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
  if (method !== 'GET' && method !== 'HEAD' && !allowed) {
    return c.json({ error: 'Forbidden origin' }, 403)
  }
  await next()
  if (allowed) c.res.headers.set('Access-Control-Allow-Origin', origin)
  c.res.headers.set('Vary', 'Origin')
})

// Security headers on every response
// Narrow CSP for HTML responses. JSON responses don't need this but it's
// harmless. Shared between the Hono middleware and the asset-wrap helper so
// both paths ship identical bytes (pre-refactor they drifted and caused a
// production-only stale-CSP bug).
const HTML_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Brand logos: simple-icons direct CDN, used as the monochrome fallback
  // when the Google favicon (via /api/favicon) 404s. Favicon fetches are
  // same-origin so they're already covered by 'self'.
  "img-src 'self' data: https://cdn.simpleicons.org",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

app.use('*', async (c, next) => {
  await next()
  const h = c.res.headers
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('X-Frame-Options', 'DENY')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  if ((h.get('Content-Type') ?? '').startsWith('text/html')) {
    h.set('Content-Security-Policy', HTML_CSP)
  }
})

app.get('/api/health', (c) => c.json({ ok: true }))

/**
 * GET /api/favicon?domain=<domain>
 *
 * Same-origin proxy for favicon.im (which resolves each domain's own
 * favicon in one hop — no 301 redirect chain, which workerd/wrangler-dev
 * fetches flake on under concurrent load). Used by ItemLogo as the
 * primary logo source. Proxying (rather than direct <img src>):
 *   - Lets the browser treat the request as same-origin → html-to-image can
 *     embed favicons into exported PNGs without CORS drama.
 *   - Edge-caches via Cloudflare's default HTML/image caching, bounded by our
 *     own `immutable` Cache-Control (only on 2xx — transient upstream errors
 *     use `no-store` so a bad response can't be pinned for a month).
 *   - Lets us swap the upstream later (Favicon.im, DuckDuckGo, etc.) without
 *     touching every client call site.
 *
 * Domain regex is deliberately strict — no scheme, path, userinfo, IP
 * literals, or single-label hosts — to prevent SSRF via crafted `?domain=`
 * inputs. Length check runs before regex to cap pathological input cost.
 */
function isValidProxyDomain(d: string | undefined): d is string {
  if (!d || d.length > MAX_DOMAIN_LENGTH) return false
  if (!/^[a-z0-9.-]+$/i.test(d)) return false
  if (d.startsWith('.') || d.endsWith('.')) return false
  if (d.startsWith('-') || d.endsWith('-')) return false
  if (!d.includes('.')) return false
  if (/^\d+\.\d+\.\d+\.\d+$/.test(d)) return false
  return true
}

app.get('/api/favicon', async (c) => {
  const domain = c.req.query('domain')
  if (!isValidProxyDomain(domain)) {
    return c.json({ error: 'bad domain' }, 400)
  }
  let upstream: Response
  try {
    upstream = await fetch(
      `https://favicon.im/${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(5000) },
    )
  } catch {
    return c.json({ error: 'upstream unavailable' }, 502)
  }
  const cacheControl = upstream.ok
    ? 'public, max-age=2592000, immutable'
    : 'no-store'
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*',
    },
  })
})

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

// Wrap an asset response with the same security headers Hono applies to API
// responses. Keeps HTML delivery out of Hono (which can't easily proxy a
// Response body) while still guaranteeing headers on every byte we serve.
function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  const ct = headers.get('Content-Type') ?? ''
  if (ct.startsWith('text/html')) {
    headers.set('Content-Security-Policy', HTML_CSP)
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx)
    }
    const assetRes = await env.ASSETS.fetch(request)
    return withSecurityHeaders(assetRes)
  },
}
