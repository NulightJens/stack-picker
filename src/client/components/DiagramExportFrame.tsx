import type { SelectedStack, StackMode } from '../../shared/types'
import DiagramCanvas, { DIAGRAM_WIDTH } from './DiagramCanvas'
import { SITE } from '../../../config/site'

/**
 * Off-screen render target used to produce the diagram PNG. Wraps the
 * DiagramCanvas with a titled frame matching the site's monochrome style.
 */
export default function DiagramExportFrame({ mode, selected }: { mode: StackMode; selected: SelectedStack }) {
  const pickedCount = Object.values(selected).filter(Boolean).length
  const kicker = 'System Design'

  return (
    <div
      data-export-root
      style={{
        width: DIAGRAM_WIDTH + 144,
        padding: 72,
        background: 'var(--background)',
        color: 'var(--text-primary)',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          My 2026 {mode.name === 'App Stack' ? 'Stack' : 'Content Operation'}
        </div>
      </div>

      {/* Diagram */}
      <DiagramCanvas mode={mode} selected={selected} forExport />

      {/* Footer */}
      <div
        style={{
          marginTop: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        <div>
          {pickedCount} {pickedCount === 1 ? 'layer' : 'layers'}
          <span style={{ margin: '0 10px', color: 'var(--border-strong)' }}>·</span>
          {SITE.meta.domain}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
          {SITE.meta.wordmark ?? SITE.brand.name}
        </div>
      </div>
    </div>
  )
}
