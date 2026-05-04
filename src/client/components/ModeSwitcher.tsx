import type { ModeId } from '../../shared/types'

interface Props {
  mode: ModeId
  onChange: (mode: ModeId) => void
}

export default function ModeSwitcher({ mode, onChange }: Props) {
  return (
    <div className="sticky top-14 z-20 bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-4 py-2">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          <ModeButton active={mode === 'app'} onClick={() => onChange('app')}>App</ModeButton>
          <ModeButton active={mode === 'content'} onClick={() => onChange('content')}>Content</ModeButton>
        </div>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-[var(--cta)] text-[var(--cta-text)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </button>
  )
}
