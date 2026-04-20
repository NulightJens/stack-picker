import type { SubscribePayload } from '../../shared/types'

export async function subscribe(payload: SubscribePayload): Promise<void> {
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({ error: 'Request failed' }))) as { error?: string }
      throw new Error(body.error || 'Request failed')
    }
  } catch (err) {
    // In Vite dev without `wrangler dev` running, the /api proxy fails.
    // Don't block the user — log locally so the prototype flow still works
    // end-to-end. In production, surface the real error.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[stack-picker dev] subscribe skipped (no Worker running):', payload, err)
      return
    }
    throw err
  }
}

const UNLOCK_KEY = 'stack-picker:unlocked-email'

export function getStoredEmail(): string | null {
  try { return localStorage.getItem(UNLOCK_KEY) } catch { return null }
}
export function setStoredEmail(email: string) {
  try { localStorage.setItem(UNLOCK_KEY, email) } catch {}
}
