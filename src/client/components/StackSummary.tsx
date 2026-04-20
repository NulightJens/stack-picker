import type { SelectedStack, StackMode } from '../../shared/types'

/** Hidden-by-default export target rendered as a neat card for PNG download. */
export default function StackSummary({ mode, selected }: { mode: StackMode; selected: SelectedStack }) {
  const picks = mode.layers
    .map(l => {
      const id = selected[l.id]
      if (!id) return null
      const item = l.items.find(i => i.id === id)
      return item ? { layer: l.name, item: item.name } : null
    })
    .filter((x): x is { layer: string; item: string } => !!x)

  return (
    <div
      data-export-root
      style={{
        width: 720,
        padding: 40,
        background: '#ffffff',
        color: '#15171a',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>⌘</div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981' }}>{mode.name}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6, marginBottom: 24 }}>My 2026 {mode.name}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {picks.map(p => (
          <div key={p.layer} style={{ padding: 14, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.layer}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{p.item}</div>
          </div>
        ))}
        {picks.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 20, textAlign: 'center', color: '#999', fontSize: 14 }}>
            Nothing picked yet.
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: '#999' }}>
        Built with Stack Picker · stack.jensheitmann.com
      </div>
    </div>
  )
}
