import { memo, useMemo } from 'react'
import type { SelectedStack, StackMode } from '../../shared/types'
import { ENTRY_NODE, tiersFor } from '../../shared/diagram'
import ItemLogo from './ItemLogo'

interface Props {
  mode: StackMode
  selected: SelectedStack
  /** Accepted for backwards compat; currently has no effect — the layout is
      the same interactive or static. */
  forExport?: boolean
}

const CANVAS_WIDTH = 1400
const CARD_WIDTH = 280
const CARD_HEIGHT = 100
const CARD_GAP = 18
const TIER_GAP = 28

interface Pick {
  id: string
  layerLabel: string
  itemLabel: string
  domain?: string
  itemId: string
  isEntry?: boolean
}

interface TierBlockData {
  id: string
  label: string
  picks: Pick[]
}

function buildTiers(mode: StackMode, selected: SelectedStack): TierBlockData[] {
  const blocks: TierBlockData[] = []

  if (mode.id === 'app') {
    blocks.push({
      id: 'entry',
      label: 'Entry',
      picks: [
        {
          id: ENTRY_NODE.id,
          layerLabel: ENTRY_NODE.layerLabel,
          itemLabel: ENTRY_NODE.itemLabel,
          itemId: ENTRY_NODE.id,
          isEntry: true,
        },
      ],
    })
  }

  for (const tier of tiersFor(mode.id)) {
    const picks: Pick[] = []
    for (const layerId of tier.layerIds) {
      const layer = mode.layers.find(l => l.id === layerId)
      if (!layer) continue
      const pickedId = selected[layerId]
      if (!pickedId) continue
      const item = layer.items.find(i => i.id === pickedId)
      if (!item) continue
      picks.push({
        id: `card-${layerId}`,
        layerLabel: layer.name,
        itemLabel: item.name,
        domain: item.domain,
        itemId: item.id,
      })
    }
    if (picks.length === 0) continue
    blocks.push({ id: tier.id, label: tier.label, picks })
  }

  return blocks
}

const Card = memo(function Card({ pick }: { pick: Pick }) {
  const isEntry = !!pick.isEntry
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        borderRadius: 14,
        // Entry node inverts vs the page theme (accent bg + accent-text text).
        // Regular cards track the page theme via surface.
        background: isEntry ? 'var(--accent)' : 'var(--surface)',
        border: `1px solid ${isEntry ? 'var(--accent)' : 'var(--border)'}`,
        color: isEntry ? 'var(--accent-text)' : 'var(--text-primary)',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <ItemLogo
        name={pick.itemLabel}
        domain={pick.domain}
        itemId={pick.itemId}
        size={56}
        rounded={12}
        inverted={isEntry}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 2,
          }}
        >
          {pick.layerLabel}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pick.itemLabel}
        </div>
      </div>
    </div>
  )
})

function TierBlock({ block }: { block: TierBlockData }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: '24px 36px 32px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 20,
        }}
      >
        {block.label}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: CARD_GAP,
          justifyContent: 'center',
        }}
      >
        {block.picks.map(p => (
          <Card key={p.id} pick={p} />
        ))}
      </div>
    </div>
  )
}

/**
 * Renders the selected stack as a system-design diagram: a vertical column
 * of boundary-box tiers (one per logical layer group), each labeled with a
 * small uppercase chip and containing the picked item cards. Matches the
 * C4 Container-diagram pattern teams already recognize.
 */
export default function DiagramCanvas({ mode, selected }: Props) {
  const tiers = useMemo(() => buildTiers(mode, selected), [mode, selected])

  return (
    <div
      style={{
        width: CANVAS_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        gap: TIER_GAP,
        boxSizing: 'border-box',
      }}
    >
      {tiers.map(t => (
        <TierBlock key={t.id} block={t} />
      ))}
    </div>
  )
}

export const DIAGRAM_WIDTH = CANVAS_WIDTH
