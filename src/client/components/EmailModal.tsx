import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export interface EmailModalProps {
  open: boolean
  title?: string
  ctaLabel: string
  onSubmit: (email: string) => Promise<void> | void
  onDismiss: () => void
}

export default function EmailModal({ open, title = 'Enter your email', ctaLabel, onSubmit, onDismiss }: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      setSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDismiss])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(email.trim().toLowerCase())
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onDismiss}>
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <img src="/jens-headshot.jpeg" alt="Jens Heitmann" className="h-10 w-10 rounded-full object-cover object-top" />
          <button onClick={onDismiss} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-4 text-xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          One-time email. Unlocks all exports for this stack.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:border-[var(--accent)] focus:outline-none text-sm"
            autoComplete="email"
          />
          {error && <div className="text-xs text-[var(--danger)]">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[var(--cta)] text-[var(--cta-text)] font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
          >
            {submitting ? 'Working…' : ctaLabel}
          </button>
        </form>

        <button onClick={onDismiss} className="mt-3 w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          Not now
        </button>

        <p className="mt-4 text-[11px] text-[var(--text-muted)] text-center">
          By continuing you agree to the Terms of Use & Privacy Policy.
        </p>
      </div>
    </div>
  )
}
