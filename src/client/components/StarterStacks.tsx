import { useMemo } from 'react'
import type { ModeId, SelectedStack, StackItem } from '../../shared/types'
import { STARTERS, type Starter } from '../../shared/starters'
import { getMode } from '../../shared/data'
import ItemLogo from './ItemLogo'

interface Props {
  mode: ModeId
  selected: SelectedStack
  applyStarter: (picks: Record<string, string>) => void
}

/**
 * Three prominent preset cards above the LayerCards grid. App-mode only —
 * lets a cold visitor populate every layer with one click instead of grinding
 * through 17 layer cards.
 *
 * The "active starter" derivation is local (not in the hook) so the rule
 * stays co-located with the UI that surfaces it: a starter is active iff
 * every layer key matches AND the user has picked all 17 layers (the count
 * check stops a partial selection from false-positively matching whichever
 * starter shares its picks so far).
 */
export default function StarterStacks({ mode, selected, applyStarter }: Props) {
  if (mode !== 'app') return null

  // Build an id -> {name, domain} lookup once per render. Cheap and avoids
  // threading the full data.ts shape through the component API.
  const itemIndex = useMemo(() => buildItemIndex(), [])

  const activeStarterId = useMemo(() => {
    const pickedCount = Object.values(selected).filter(Boolean).length
    if (pickedCount !== 17) return null
    for (const starter of STARTERS) {
      let matches = true
      for (const [layerId, itemId] of Object.entries(starter.picks)) {
        if (selected[layerId] !== itemId) {
          matches = false
          break
        }
      }
      if (matches) return starter.id
    }
    return null
  }, [selected])

  const handleApply = (starter: Starter) => {
    applyStarter(starter.picks)
  }

  return (
    <section className="mb-8 sm:mb-12">
      <header className="mb-4 text-center">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Starter Stacks
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Skip the picker — start from a complete stack and tweak from there.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STARTERS.map(starter => {
          const isActive = starter.id === activeStarterId
          return (
            <article
              key={starter.id}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onClick={() => handleApply(starter)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleApply(starter)
                }
              }}
              className={`group flex flex-col rounded-xl border bg-[var(--surface)] p-5 sm:p-6 text-left cursor-pointer transition-all hover:border-[var(--border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isActive
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]'
                  : 'border-[var(--border)]'
              }`}
            >
              <header className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                    {starter.name}
                  </h3>
                  {isActive && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-text)] text-[10px] font-bold tracking-wider uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{starter.tagline}</p>
              </header>

              <div className="flex flex-wrap gap-2 mb-5">
                {starter.highlight.map(itemId => {
                  const item = itemIndex.get(itemId)
                  if (!item) return null
                  return (
                    <div
                      key={itemId}
                      title={item.name}
                      className="rounded-lg bg-[var(--background)]"
                    >
                      <ItemLogo
                        name={item.name}
                        domain={item.domain}
                        itemId={item.id}
                        size={34}
                        rounded={8}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={e => {
                    // Stop the parent card's onClick from firing twice.
                    e.stopPropagation()
                    handleApply(starter)
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-[var(--cta)] text-[var(--cta-text)] text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {isActive ? 'Stack applied' : 'Use this stack'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/** Flatten APP_MODE's layers into an id -> StackItem lookup. */
function buildItemIndex(): Map<string, StackItem> {
  const index = new Map<string, StackItem>()
  for (const layer of getMode('app').layers) {
    for (const item of layer.items) {
      index.set(item.id, item)
    }
  }
  return index
}
