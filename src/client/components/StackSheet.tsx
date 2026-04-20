import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Download, Image as ImageIcon, RotateCcw, FileCode, X } from 'lucide-react'
import type { SelectedStack, StackMode } from '../../shared/types'
import ItemLogo from './ItemLogo'
import type { BottomAction } from './BottomBar'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export interface StackSheetProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  mode: StackMode
  selected: SelectedStack
  onAction: (a: BottomAction) => void
}

interface Pick {
  layer: string
  item: string
  domain?: string
  itemId: string
}

export default function StackSheet({ open, onOpenChange, mode, selected, onAction }: StackSheetProps) {
  const picks: Pick[] = useMemo(
    () =>
      mode.layers.flatMap<Pick>(l => {
        const sid = selected[l.id]
        if (!sid) return []
        const item = l.items.find(i => i.id === sid)
        if (!item) return []
        return [{ layer: l.name, item: item.name, domain: item.domain, itemId: item.id }]
      }),
    [mode, selected],
  )

  const [dragY, setDragY] = useState(0)
  const dragStartY = useRef<number | null>(null)
  const dragging = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  // Reset drag offset every time the sheet re-opens.
  useEffect(() => {
    if (open) setDragY(0)
  }, [open])

  const sheetRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // Capture the element that had focus before the sheet opened, then focus
  // the primary action. On close, restore focus to the opener.
  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement as HTMLElement | null
    const primary = sheetRef.current?.querySelector<HTMLButtonElement>('[data-sheet-primary]')
    primary?.focus()
    return () => {
      openerRef.current?.focus?.()
    }
  }, [open])

  // Trap Tab / Shift+Tab inside the sheet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const root = sheetRef.current
      if (!root) return
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        el => !el.hasAttribute('disabled') && el.offsetParent !== null,
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const fire = (a: BottomAction) => {
    onAction(a)
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="stack-sheet-title" id="stack-sheet">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 bottom-0 bg-[var(--surface)] rounded-t-2xl shadow-2xl border-t border-[var(--border)] flex flex-col sheet-slide"
        style={{
          maxHeight: '85vh',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          touchAction: 'pan-y',
        }}
        onPointerDown={e => {
          // Only start drag if the gesture begins on the drag handle OR the header
          // — not on the scrolling pick list (or the action buttons below it).
          const target = e.target as HTMLElement
          if (!target.closest('[data-sheet-grip]')) return
          dragging.current = true
          dragStartY.current = e.clientY
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={e => {
          if (!dragging.current || dragStartY.current == null) return
          const delta = e.clientY - dragStartY.current
          setDragY(Math.max(0, delta))
        }}
        onPointerUp={e => {
          if (!dragging.current) return
          dragging.current = false
          dragStartY.current = null
          ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
          if (dragY > 80) onOpenChange(false)
          else setDragY(0)
        }}
        onPointerCancel={e => {
          if (!dragging.current) return
          dragging.current = false
          dragStartY.current = null
          ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
          setDragY(0)
        }}
      >
        <div data-sheet-grip>
          <div className="flex flex-col items-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" aria-hidden />
          </div>

          <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h2 id="stack-sheet-title" className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-primary)]">
              Your stack ({picks.length})
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close stack sheet"
              className="p-1 rounded hover:bg-[var(--surface-hover)]"
            >
              <X size={18} />
            </button>
          </header>
        </div>

        {/* Pick list */}
        <ul className="overflow-y-auto px-2 py-2" style={{ maxHeight: '60vh' }}>
          {picks.length === 0 ? (
            <li className="px-3 py-6 text-sm text-[var(--text-secondary)] text-center">
              Nothing picked yet — close this and start tapping.
            </li>
          ) : (
            picks.map(p => (
              <li key={p.itemId} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <ItemLogo name={p.item} domain={p.domain} itemId={p.itemId} size={28} rounded={7} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text-muted)] truncate">
                    {p.layer}
                  </div>
                  <div className="text-sm font-semibold truncate">{p.item}</div>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Action group */}
        <div className="border-t border-[var(--border)] p-3 flex flex-col gap-2">
          <button
            onClick={() => fire('copy_prompt')}
            data-sheet-primary
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--cta)] text-[var(--cta-text)] text-sm font-bold"
          >
            <Copy size={16} />
            Copy prompt
          </button>
          <div className="grid grid-cols-2 gap-2">
            <SecondaryBtn onClick={() => fire('copy_stack_image')} icon={<ImageIcon size={14} />}>Copy image</SecondaryBtn>
            <SecondaryBtn onClick={() => fire('download_png')} icon={<Download size={14} />}>Download PNG</SecondaryBtn>
            <SecondaryBtn onClick={() => fire('download_diagram')} icon={<FileCode size={14} />}>Diagram</SecondaryBtn>
            <SecondaryBtn onClick={() => fire('reset')} icon={<RotateCcw size={14} />} danger>Reset</SecondaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecondaryBtn({
  onClick,
  icon,
  danger,
  children,
}: { onClick: () => void; icon: React.ReactNode; danger?: boolean; children: React.ReactNode }) {
  const base = 'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors'
  const tone = danger
    ? 'border-[var(--border)] bg-[var(--background)] text-[var(--danger)] hover:bg-[var(--surface-hover)]'
    : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
  return (
    <button onClick={onClick} className={`${base} ${tone}`}>
      {icon}
      <span>{children}</span>
    </button>
  )
}
