import type { SubscribePayload } from '../../shared/types'

export async function subscribe(payload: SubscribePayload): Promise<void> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: 'Request failed' }))) as { error?: string }
    throw new Error(body.error || 'Request failed')
  }
}

const UNLOCK_KEY = 'stack-picker:unlocked-email'

export function getStoredEmail(): string | null {
  try { return localStorage.getItem(UNLOCK_KEY) } catch { return null }
}
export function setStoredEmail(email: string) {
  try { localStorage.setItem(UNLOCK_KEY, email) } catch {}
}
