import { useState } from 'react'
import { initialsFor, logoFallbackUrl, logoUrl } from '../../shared/icons'
import { ICON_SLUGS, simpleIconUrl } from '../../shared/iconSlugs'

type Variant = 'light-on-dark' | 'dark-on-light'
type Stage = 'clearbit' | 'favicon' | 'simpleicons' | 'initials'

interface Props {
  name: string
  domain?: string
  /** Our internal item id — used to look up a Simple Icons slug. */
  itemId?: string
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
 * Fallback chain for rendering a tool's logo:
 *   1. Clearbit brand API (full-color brand logo)
 *   2. Google favicon (reliable but low-fi)
 *   3. Simple Icons CDN (clean monochrome brand SVG)
 *   4. Initials monogram tile
 */
export default function ItemLogo({ name, domain, itemId, size, rounded, variant = 'dark-on-light' }: Props) {
  const slug = itemId ? ICON_SLUGS[itemId] : undefined
  const initialStage: Stage = domain ? 'clearbit' : slug ? 'simpleicons' : 'initials'
  const [stage, setStage] = useState<Stage>(initialStage)
  const radius = rounded ?? Math.round(size * 0.22)

  const advance = () => {
    setStage(prev => {
      if (prev === 'clearbit') return 'favicon'
      if (prev === 'favicon') return slug ? 'simpleicons' : 'initials'
      if (prev === 'simpleicons') return 'initials'
      return 'initials'
    })
  }

  if (stage === 'initials') {
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

  let src = ''
  if (stage === 'clearbit' && domain) src = logoUrl(domain, size * 2)
  else if (stage === 'favicon' && domain) src = logoFallbackUrl(domain, size * 2)
  else if (stage === 'simpleicons' && slug) src = simpleIconUrl(slug)

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
      onError={advance}
    />
  )
}
