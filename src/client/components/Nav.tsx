import { Moon, Sun } from 'lucide-react'
import type { ModeId } from '../../shared/types'
import { SITE, type NavLink } from '../../../config/site'

interface Props {
  mode: ModeId
  onModeChange: (m: ModeId) => void
  dark: boolean
  onToggleDark: () => void
}

export default function Nav({ mode, onModeChange, dark, onToggleDark }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] safe-area-top">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <a href={SITE.brand.href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-base font-bold tracking-tight">{SITE.brand.name}</span>
          <Avatar />
        </a>

        {SITE.nav.length > 0 && (
          <nav className="hidden sm:flex items-center gap-4 ml-2 text-sm">
            {SITE.nav.map(link => (
              <NavLinkItem key={link.label} link={link} />
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <ModeButton active={mode === 'app'} onClick={() => onModeChange('app')}>App</ModeButton>
          <ModeButton active={mode === 'content'} onClick={() => onModeChange('content')}>Content</ModeButton>
        </div>

        <button
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}

function Avatar() {
  if (SITE.brand.avatarSrc) {
    return (
      <img
        src={SITE.brand.avatarSrc}
        alt={SITE.brand.name}
        className="h-8 w-8 rounded-full object-cover object-top"
      />
    )
  }
  const initials = SITE.brand.name
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden
      className="h-8 w-8 rounded-full bg-[var(--cta)] text-[var(--cta-text)] flex items-center justify-center text-xs font-bold"
    >
      {initials}
    </span>
  )
}

function NavLinkItem({ link }: { link: NavLink }) {
  const baseCls = link.active
    ? 'text-[var(--text-primary)] font-semibold'
    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
  return (
    <a
      href={link.href}
      aria-current={link.active ? 'page' : undefined}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className={baseCls}
    >
      {link.label}
    </a>
  )
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        active
          ? 'bg-[var(--cta)] text-[var(--cta-text)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  )
}
