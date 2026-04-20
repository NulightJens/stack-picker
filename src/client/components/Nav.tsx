import { Moon, Sun } from 'lucide-react'
import type { ModeId } from '../../shared/types'

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
        <a href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">Jens Heitmann</span>
          <img
            src="/jens-headshot.jpeg"
            alt="Jens Heitmann"
            className="h-8 w-8 rounded-full object-cover object-top"
          />
        </a>

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
