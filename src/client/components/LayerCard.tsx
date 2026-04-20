import { Check } from 'lucide-react'
import type { StackLayer } from '../../shared/types'
import ItemLogo from './ItemLogo'

interface Props {
  layer: StackLayer
  selectedItemId: string | null | undefined
  onToggle: (layerId: string, itemId: string) => void
}

export default function LayerCard({ layer, selectedItemId, onToggle }: Props) {
  const isStyle = layer.kind === 'style'

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <header className="mb-3">
        <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--text-primary)]">
          {layer.name}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{layer.subtitle}</div>
      </header>

      <div className={isStyle ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1.5'}>
        {layer.items.map(item => {
          const selected = selectedItemId === item.id
          return (
            <button
              key={item.id}
              onClick={() => onToggle(layer.id, item.id)}
              className={
                isStyle
                  ? `px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text)]'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }`
                  : `group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)]'
                    }`
              }
            >
              {isStyle ? (
                item.name
              ) : (
                <>
                  <ItemLogo name={item.name} domain={item.domain} itemId={item.id} size={24} />
                  <span className="text-sm font-medium flex-1 text-left">{item.name}</span>
                  <span
                    aria-hidden
                    className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      selected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {selected && <Check size={11} strokeWidth={3} className="text-[var(--accent-text)]" />}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
