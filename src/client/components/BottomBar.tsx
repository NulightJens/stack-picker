import { Copy, Download, Image as ImageIcon, RotateCcw, FileCode } from 'lucide-react'
import type { SelectedStack, StackMode } from '../../shared/types'

export type BottomAction = 'copy_prompt' | 'copy_stack_image' | 'download_png' | 'download_diagram' | 'reset'

interface Props {
  mode: StackMode
  selected: SelectedStack
  pickedCount: number
  onAction: (a: BottomAction) => void
}

export default function BottomBar({ mode, selected, pickedCount, onAction }: Props) {
  const picks = mode.layers
    .map(l => (selected[l.id] ? l.items.find(i => i.id === selected[l.id])?.name : null))
    .filter(Boolean) as string[]

  return (
    <footer className="sticky bottom-0 z-20 safe-area-bottom bg-[var(--surface)]/95 backdrop-blur border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)]">Your stack</div>
          <div className="text-sm font-medium truncate">
            {pickedCount === 0
              ? <span className="text-[var(--text-secondary)]">Nothing picked yet — start clicking.</span>
              : <span>{picks.slice(0, 4).join(' · ')}{picks.length > 4 && ` · +${picks.length - 4} more`}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <ActionBtn primary onClick={() => onAction('copy_prompt')} icon={<Copy size={14} />}>Copy prompt</ActionBtn>
          <ActionBtn onClick={() => onAction('copy_stack_image')} icon={<ImageIcon size={14} />}>Copy stack image</ActionBtn>
          <ActionBtn onClick={() => onAction('download_png')} icon={<Download size={14} />}>Download PNG</ActionBtn>
          <ActionBtn onClick={() => onAction('download_diagram')} icon={<FileCode size={14} />}>Download diagram</ActionBtn>
          <ActionBtn onClick={() => onAction('reset')} icon={<RotateCcw size={14} />} danger>Reset</ActionBtn>
        </div>
      </div>
    </footer>
  )
}

function ActionBtn({
  primary, danger, onClick, icon, children,
}: { primary?: boolean; danger?: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  const cls = primary
    ? 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]'
    : danger
      ? 'bg-[var(--background)] text-[var(--danger)] border border-[var(--border)] hover:bg-[var(--surface-hover)]'
      : 'bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-hover)]'
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${cls}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
