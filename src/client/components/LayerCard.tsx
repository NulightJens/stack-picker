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

      {isStyle ? (
        <div className="flex flex-wrap gap-2">
          {layer.items.map(item => {
            const selected = selectedItemId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onToggle(layer.id, item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text)]'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {item.name}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-col md:gap-1.5">
          {layer.items.map(item => {
            const selected = selectedItemId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onToggle(layer.id, item.id)}
                className={`group relative rounded-xl border text-left transition-all active:scale-[0.98] ${
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)]'
                } p-3.5 md:p-0 md:border-0 md:bg-transparent md:hover:border-0 md:rounded-lg`}
              >
                {/* Narrow: card layout (logo top-left, label below). */}
                <div className="md:hidden">
                  <ItemLogo name={item.name} domain={item.domain} itemId={item.id} size={32} />
                  <div className="mt-2.5 text-[12px] font-bold leading-tight line-clamp-2 text-[var(--text-primary)]">
                    {item.name}
                  </div>
                  <span
                    aria-hidden
                    className={`absolute top-2 right-2 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      selected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)] bg-[var(--background)]'
                    }`}
                  >
                    {selected && <Check size={11} strokeWidth={3} className="text-[var(--accent-text)]" />}
                  </span>
                </div>

                {/* md+: original horizontal row layout. */}
                <div
                  className={`hidden md:flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[var(--background)] group-hover:border-[var(--border-strong)]'
                  }`}
                >
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
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
