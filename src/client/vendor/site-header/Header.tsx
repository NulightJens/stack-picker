import { useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import {
  DESTINATIONS,
  HOME_URL,
  LOGO_SRC,
  WORDMARK,
  CTA_URL,
  CTA_LABEL,
  type CurrentSiteId,
} from './destinations'
import { HeaderMobileSheet } from './HeaderMobileSheet'

export interface SiteHeaderLinkProps {
  to: string
  children: ReactNode
  className?: string
  'aria-current'?: 'page' | undefined
}

export interface HeaderProps {
  currentSite: CurrentSiteId
  dark: boolean
  onToggleDark: () => void
  /**
   * Optional same-origin <Link>. When provided, used for the row whose href
   * matches the current site's href (i.e. resource-library passes its
   * react-router Link so its self-link does not full-page-reload).
   * Cross-site links always use a plain <a>.
   */
  LinkComponent?: ComponentType<SiteHeaderLinkProps>
}

export function Header({ currentSite, dark, onToggleDark, LinkComponent }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          {/* Left: logo + wordmark (wordmark hidden <md) */}
          <a
            href={HOME_URL}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label={`${WORDMARK} home`}
          >
            <img
              src={LOGO_SRC}
              alt=""
              className="h-8 w-8 rounded-full object-cover object-top"
              width={32}
              height={32}
            />
            <span className="hidden text-base font-bold tracking-tight md:inline">
              {WORDMARK}
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-5 md:flex">
            {DESTINATIONS.map(dest => {
              const isCurrent = dest.id === currentSite
              const sameHost = isSameHost(dest.href)
              const className = isCurrent
                ? 'text-sm font-semibold text-[var(--text-primary)]'
                : 'text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
              if (LinkComponent && sameHost) {
                const path = new URL(dest.href).pathname || '/'
                return (
                  <LinkComponent
                    key={dest.id}
                    to={path}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={className}
                  >
                    {dest.label}
                  </LinkComponent>
                )
              }
              if (isCurrent) {
                return (
                  <span
                    key={dest.id}
                    aria-current="page"
                    className={className}
                  >
                    {dest.label}
                  </span>
                )
              }
              return (
                <a
                  key={dest.id}
                  href={dest.href}
                  className={className}
                >
                  {dest.label}
                </a>
              )
            })}
            <a
              href={CTA_URL}
              className="ml-1 rounded-full bg-[var(--text-primary)] px-4 py-1.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-80"
            >
              {CTA_LABEL}
            </a>
            <DarkToggle dark={dark} onToggleDark={onToggleDark} />
          </nav>

          {/* Mobile right cluster: dark toggle + hamburger */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <DarkToggle dark={dark} onToggleDark={onToggleDark} />
            <button
              ref={hamburgerRef}
              type="button"
              aria-label={mobileOpen ? 'Close site navigation' : 'Open site navigation'}
              aria-expanded={mobileOpen}
              aria-controls="site-header-mobile-sheet"
              onClick={() => setMobileOpen(o => !o)}
              className="grid h-11 w-11 place-items-center rounded-md text-[var(--text-primary)] hover:bg-[var(--surface)]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div id="site-header-mobile-sheet">
        <HeaderMobileSheet
          open={mobileOpen}
          currentSite={currentSite}
          onClose={() => setMobileOpen(false)}
          returnFocusRef={hamburgerRef}
        />
      </div>
    </>
  )
}

function DarkToggle({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggleDark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-11 w-11 place-items-center rounded-md text-[var(--text-primary)] hover:bg-[var(--surface)]"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

function isSameHost(absoluteUrl: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return new URL(absoluteUrl).host === window.location.host
  } catch {
    return false
  }
}
