import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  SITE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/health', (c) => c.json({ ok: true }))

/** POST /api/subscribe — store email + stack snapshot, gate downloads */
app.post('/api/subscribe', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const { email, action, mode, stack } = body ?? {}

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'Invalid email' }, 400)
  }
  if (typeof action !== 'string' || !['copy_prompt', 'copy_stack_image', 'download_png', 'download_diagram', 'reset'].includes(action)) {
    return c.json({ error: 'Invalid action' }, 400)
  }
  if (mode !== 'app' && mode !== 'content') {
    return c.json({ error: 'Invalid mode' }, 400)
  }
  if (typeof stack !== 'object' || stack == null) {
    return c.json({ error: 'Invalid stack' }, 400)
  }

  const userAgent = c.req.header('User-Agent') ?? null
  try {
    await c.env.DB
      .prepare(
        'INSERT INTO subscribers (email, action, mode, stack_json, user_agent) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(email.toLowerCase(), action, mode, JSON.stringify(stack), userAgent)
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
