import type { SelectedStack, StackMode } from '../../shared/types'

/**
 * Off-screen export target. Rendered wide and landscape for social/slide use.
 * Jens palette: dark charcoal bg, white text, neutral gray accents (no green).
 */
export default function StackSummary({ mode, selected }: { mode: StackMode; selected: SelectedStack }) {
  const picks = mode.layers
    .map(l => {
      const id = selected[l.id]
      if (!id) return null
      const item = l.items.find(i => i.id === id)
      return item ? { layer: l.name, item: item.name } : null
    })
    .filter((x): x is { layer: string; item: string } => !!x)

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
          <Card key={p.layer} layer={p.layer} item={p.item} />
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
          stack.jensheitmann.com
        </div>
        <div style={{ fontWeight: 700, color: '#888' }}>Jens Heitmann</div>
      </div>
    </div>
  )
}

function Card({ layer, item }: { layer: string; item: string }) {
  const initials = getInitials(item)
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
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: 14,
          background: '#ffffff',
          color: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: initials.length > 1 ? 22 : 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {initials}
      </div>
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

/** Cheap initials from an item name: up to 2 chars, uppercase. */
function getInitials(name: string): string {
  const cleaned = name.replace(/[()]/g, '').trim()
  const words = cleaned.split(/[\s/.-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    // Single word: first two chars (e.g. "React" -> "Re")
    return words[0].slice(0, 2).toUpperCase()
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}
