import { useEffect, useRef, type RefObject } from 'react'
import { DESTINATIONS, CTA_URL, CTA_LABEL, type CurrentSiteId } from './destinations'
import { useScrollLock } from './use-scroll-lock'
import { useEscapeKey } from './use-escape-key'

interface Props {
  open: boolean
  currentSite: CurrentSiteId
  onClose: () => void
  /**
   * The hamburger button in the header bar. When the sheet closes, focus is
   * returned here so keyboard users do not get dropped at the page top.
   */
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function HeaderMobileSheet({ open, currentSite, onClose, returnFocusRef }: Props) {
  useScrollLock(open)
  useEscapeKey(open, onClose)

  const sheetRef = useRef<HTMLDivElement | null>(null)
  const wasOpenRef = useRef(false)

  // On open: focus the first focusable element inside the sheet.
  // On close (from open): return focus to the hamburger button.
  useEffect(() => {
    if (open) {
      const first = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      first?.focus()
      wasOpenRef.current = true
    } else if (wasOpenRef.current) {
      returnFocusRef?.current?.focus()
      wasOpenRef.current = false
    }
  }, [open, returnFocusRef])

  // Tab focus trap: while open, Tab off the last element wraps to first,
  // Shift+Tab off the first wraps to last.
  useEffect(() => {
    if (!open) return
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const root = sheetRef.current
      if (!root) return
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleTab)
    return () => window.removeEventListener('keydown', handleTab)
  }, [open])

  // Conditional render: when closed, the sheet + backdrop don't exist in the
  // DOM at all. No translate math, no opacity layering, no chance of leakage.
  // Animation is sacrificed for correctness; can revisit with React Transition
  // primitives later if the snap-in/snap-out feels harsh.
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close site navigation"
        onClick={onClose}
        className="fixed inset-0 z-20 bg-black/40"
      />
      <div className="fixed inset-x-0 top-14 z-40">
        <div
          ref={sheetRef}
          role="dialog"
          aria-label="Site navigation"
          className="border-b border-[var(--border)] bg-[var(--background)] shadow-md"
        >
          <ul className="flex flex-col">
            {DESTINATIONS.map(dest => {
              const isCurrent = dest.id === currentSite
              const rowClass = `flex h-14 items-center justify-between px-5 text-base ${
                isCurrent
                  ? 'bg-[var(--cta)] font-semibold text-[var(--cta-text)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface)] active:bg-[var(--surface)]'
              }`
              const subdomainClass = `text-xs ${
                isCurrent ? 'opacity-80' : 'text-[var(--text-secondary)]'
              }`
              return (
                <li key={dest.id}>
                  {isCurrent ? (
                    <div aria-current="page" className={rowClass}>
                      <span>{dest.label}</span>
                      <span className={subdomainClass}>{dest.subdomain}</span>
                    </div>
                  ) : (
                    <a href={dest.href} onClick={onClose} className={rowClass}>
                      <span>{dest.label}</span>
                      <span className={subdomainClass}>{dest.subdomain}</span>
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="px-5 py-4">
            <a
              href={CTA_URL}
              onClick={onClose}
              className="flex h-12 items-center justify-center rounded-full bg-[var(--text-primary)] text-base font-semibold text-[var(--background)] transition-opacity hover:opacity-80"
            >
              {CTA_LABEL}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
