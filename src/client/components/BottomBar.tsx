import { Copy, Download, Image as ImageIcon, RotateCcw, FileCode } from 'lucide-react'
import type { SelectedStack, StackMode } from '../../shared/types'
import ItemLogo from './ItemLogo'

export type BottomAction = 'copy_prompt' | 'copy_stack_image' | 'download_png' | 'download_diagram' | 'reset'

interface Props {
  mode: StackMode
  selected: SelectedStack
  pickedCount: number
  onAction: (a: BottomAction) => void
}

interface Pick {
  layer: string
  item: string
  domain?: string
  itemId: string
}

/** How many icons to show inline before collapsing the rest into "+N more". */
const INLINE_ICON_COUNT = 6

export default function BottomBar({ mode, selected, pickedCount, onAction }: Props) {
  const picks: Pick[] = mode.layers
    .flatMap<Pick>(l => {
      const sid = selected[l.id]
      if (!sid) return []
      const item = l.items.find(i => i.id === sid)
      if (!item) return []
      return [{ layer: l.name, item: item.name, domain: item.domain, itemId: item.id }]
    })

  const inline = picks.slice(0, INLINE_ICON_COUNT)
  const overflow = picks.length - inline.length

  return (
    <footer className="sticky bottom-0 z-20 safe-area-bottom bg-[var(--surface)]/95 backdrop-blur border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0 relative group">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5">
            Your stack
          </div>

          {pickedCount === 0 ? (
            <div className="text-sm text-[var(--text-secondary)]">Nothing picked yet — start clicking.</div>
          ) : (
            <div className="flex items-center">
              {inline.map((p, i) => (
                <div
                  key={p.itemId}
                  title={`${p.layer}: ${p.item}`}
                  className="rounded-full ring-2 ring-[var(--surface)] bg-[var(--background)]"
                  style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 100 - i }}
                >
                  <ItemLogo name={p.item} domain={p.domain} itemId={p.itemId} size={24} rounded={12} />
                </div>
              ))}
              {overflow > 0 && (
                <div
                  className="ml-1.5 h-6 px-2 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center text-[11px] font-semibold text-[var(--text-secondary)]"
                  style={{ zIndex: 90 }}
                >
                  +{overflow} more
                </div>
              )}
              <span className="ml-2 text-[11px] text-[var(--text-muted)] hidden sm:inline">
                (hover to see all)
              </span>
            </div>
          )}

          {/* Hover popover — full vertical list of every pick */}
          {pickedCount > 0 && (
            <div
              className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto
                absolute left-0 bottom-full mb-3 z-40
                w-72 max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border)]
                bg-[var(--surface)] shadow-xl p-2"
            >
              <div className="px-2 pt-1 pb-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] sticky top-0 bg-[var(--surface)]">
                Your stack ({picks.length})
              </div>
              <ul className="flex flex-col">
                {picks.map(p => (
                  <li key={p.itemId} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-hover)]">
                    <ItemLogo name={p.item} domain={p.domain} itemId={p.itemId} size={22} rounded={6} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text-muted)] truncate">
                        {p.layer}
                      </div>
                      <div className="text-sm font-semibold truncate">{p.item}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
    ? 'bg-[var(--cta)] text-[var(--cta-text)] hover:bg-[var(--accent-hover)]'
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
