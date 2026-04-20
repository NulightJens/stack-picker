import type { SelectedStack, StackMode } from '../../shared/types'
import ItemLogo from './ItemLogo'
import { SITE } from '../../../config/site'

/**
 * Off-screen export target. Rendered wide and landscape for social/slide use.
 * Monochrome palette — dark charcoal bg, white text, neutral gray accents.
 */
export default function StackSummary({ mode, selected }: { mode: StackMode; selected: SelectedStack }) {
  const picks = mode.layers
    .map(l => {
      const id = selected[l.id]
      if (!id) return null
      const item = l.items.find(i => i.id === id)
      return item ? { layer: l.name, item: item.name, domain: item.domain, itemId: item.id } : null
    })
    .filter((x): x is NonNullable<typeof x> => !!x)

  const kicker = mode.name === 'App Stack' ? '2026 Development Tools' : '2026 Content Operation'

  return (
    <div
      data-export-root
      style={{
        width: 1400,
        padding: 72,
        background:
          'radial-gradient(ellipse 800px 500px at 80% 0%, rgba(255,255,255,0.04), transparent 70%), #0a0a0a',
        color: '#fafafa',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: 12,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1,
            color: '#ffffff',
          }}
        >
          My 2026 Stack
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {picks.map(p => (
          <Card key={p.layer} layer={p.layer} item={p.item} domain={p.domain} itemId={p.itemId} />
        ))}
        {picks.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 48,
              textAlign: 'center',
              color: '#666',
              fontSize: 18,
              border: '1px dashed #222',
              borderRadius: 14,
            }}
          >
            Nothing picked yet — start clicking.
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 56,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 14,
          color: '#555',
          letterSpacing: '0.02em',
        }}
      >
        <div>
          {picks.length} {picks.length === 1 ? 'layer' : 'layers'}
          <span style={{ margin: '0 10px', color: '#333' }}>·</span>
          {SITE.meta.domain}
        </div>
        <div style={{ fontWeight: 700, color: '#888' }}>{SITE.meta.wordmark ?? SITE.brand.name}</div>
      </div>
    </div>
  )
}

function Card({ layer, item, domain, itemId }: { layer: string; item: string; domain?: string; itemId?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '22px 24px',
        borderRadius: 14,
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <ItemLogo name={item} domain={domain} itemId={itemId} size={64} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: 4,
          }}
        >
          {layer}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item}
        </div>
      </div>
    </div>
  )
}

