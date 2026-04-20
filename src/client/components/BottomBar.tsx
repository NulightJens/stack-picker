import { useEffect, useRef, useState } from 'react'
import { Copy, Download, Image as ImageIcon, RotateCcw, FileCode, MoreHorizontal } from 'lucide-react'
import type { SelectedStack, StackMode } from '../../shared/types'
import ItemLogo from './ItemLogo'
import StackSheet from './StackSheet'
import { useIsTouch } from '../hooks/useIsTouch'

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

const INLINE_ICON_COUNT = 6
const CLOSE_DELAY_MS = 180

export default function BottomBar({ mode, selected, pickedCount, onAction }: Props) {
  const isTouch = useIsTouch()
  const [sheetOpen, setSheetOpen] = useState(false)

  // If the user hot-plugs a mouse (or rotates their tablet past the breakpoint),
  // close the sheet — desktop UI renders its own popover now.
  useEffect(() => {
    if (!isTouch && sheetOpen) setSheetOpen(false)
  }, [isTouch, sheetOpen])

  const picks: Pick[] = mode.layers.flatMap<Pick>(l => {
    const sid = selected[l.id]
    if (!sid) return []
    const item = l.items.find(i => i.id === sid)
    if (!item) return []
    return [{ layer: l.name, item: item.name, domain: item.domain, itemId: item.id }]
  })

  const inline = picks.slice(0, INLINE_ICON_COUNT)
  const overflow = picks.length - inline.length

  return (
    <>
      <footer className="sticky bottom-0 z-20 safe-area-bottom bg-[var(--surface)]/95 backdrop-blur border-t border-[var(--border)]">
        {isTouch ? (
          <TouchStrip
            picks={inline}
            overflow={overflow}
            pickedCount={pickedCount}
            onOpenSheet={() => setSheetOpen(true)}
            onPrimary={() => onAction('copy_prompt')}
          />
        ) : (
          <HoverStrip
            mode={mode}
            selected={selected}
            pickedCount={pickedCount}
            inline={inline}
            overflow={overflow}
            picks={picks}
            onAction={onAction}
          />
        )}
      </footer>

      {isTouch && (
        <StackSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          mode={mode}
          selected={selected}
          onAction={onAction}
        />
      )}
    </>
  )
}

// ---------- Touch strip ----------

function TouchStrip({
  picks,
  overflow,
  pickedCount,
  onOpenSheet,
  onPrimary,
}: {
  picks: Pick[]
  overflow: number
  pickedCount: number
  onOpenSheet: () => void
  onPrimary: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
      <button
        onClick={onOpenSheet}
        aria-label="View full stack"
        aria-controls="stack-sheet"
        className="flex items-center text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-1.5">
            Your stack
          </div>
          {pickedCount === 0 ? (
            <div className="text-sm text-[var(--text-secondary)]">Nothing picked yet — start tapping.</div>
          ) : (
            <div className="flex items-center">
              {picks.map((p, i) => (
                <div
                  key={p.itemId}
                  className="rounded-full ring-2 ring-[var(--surface)] bg-[var(--background)]"
                  style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 100 - i }}
                >
                  <ItemLogo name={p.item} domain={p.domain} itemId={p.itemId} size={22} rounded={11} />
                </div>
              ))}
              {overflow > 0 && (
                <div className="ml-1.5 h-6 px-2 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center text-[11px] font-semibold text-[var(--text-secondary)]">
                  +{overflow} more
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] ml-2">Tap ↑</div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrimary}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--cta)] text-[var(--cta-text)] text-sm font-bold"
        >
          <Copy size={16} />
          Copy prompt
        </button>
        <button
          onClick={onOpenSheet}
          aria-label="More actions"
          aria-controls="stack-sheet"
          className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}

// ---------- Hover strip (desktop — unchanged behavior) ----------

function HoverStrip({
  pickedCount,
  inline,
  overflow,
  picks,
  onAction,
}: {
  mode: StackMode
  selected: SelectedStack
  pickedCount: number
  inline: Pick[]
  overflow: number
  picks: Pick[]
  onAction: (a: BottomAction) => void
}) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const openPopover = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setPopoverOpen(true)
  }

  const schedulePopoverClose = () => {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setPopoverOpen(false), CLOSE_DELAY_MS)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div
        className="flex-1 min-w-0 relative"
        onMouseEnter={openPopover}
        onMouseLeave={schedulePopoverClose}
      >
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
            <span className="ml-2 text-[11px] text-[var(--text-muted)] hidden sm:inline">(hover to see all)</span>
          </div>
        )}

        {pickedCount > 0 && (
          <div
            onMouseEnter={openPopover}
            onMouseLeave={schedulePopoverClose}
            className={`absolute left-0 bottom-full z-40 pt-3 transition-opacity duration-150 ${
              popoverOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-72 max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-2">
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
  )
}

function ActionBtn({
  primary,
  danger,
  onClick,
  icon,
  children,
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
