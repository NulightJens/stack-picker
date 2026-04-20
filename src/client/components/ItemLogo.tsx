import { useState } from 'react'
import { initialsFor, logoFallbackUrl, logoUrl } from '../../shared/icons'

type Variant = 'light-on-dark' | 'dark-on-light'

interface Props {
  name: string
  domain?: string
  size: number
  rounded?: number
  /**
   * "dark-on-light" — white tile with dark initials (default, matches cards on
   *   light bg and the inverted cards in dark mode).
   * "light-on-dark" — dark tile with light initials (for use on white bg in
   *   exports).
   */
  variant?: Variant
}

/**
 * Renders the tool's logo fetched from Clearbit with a Google-favicon fallback.
 * When both fail (or when no domain is known) we show a monogram tile.
 */
export default function ItemLogo({ name, domain, size, rounded, variant = 'dark-on-light' }: Props) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'initials'>(domain ? 'primary' : 'initials')
  const radius = rounded ?? Math.round(size * 0.22)

  if (stage === 'initials' || !domain) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: radius,
          background: variant === 'light-on-dark' ? '#0a0a0a' : '#ffffff',
          color: variant === 'light-on-dark' ? '#ffffff' : '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(10, Math.round(size * 0.38)),
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        {initialsFor(name)}
      </div>
    )
  }

  const src = stage === 'primary' ? logoUrl(domain, size * 2) : logoFallbackUrl(domain, size * 2)

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        objectFit: 'contain',
        background: '#ffffff',
        padding: Math.max(2, Math.round(size * 0.08)),
      }}
      onError={() => setStage(stage === 'primary' ? 'fallback' : 'initials')}
    />
  )
}
