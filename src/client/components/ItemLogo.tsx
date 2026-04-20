import { useState, useSyncExternalStore } from 'react'
import { initialsFor } from '../../shared/icons'
import { ICON_SLUGS, iconUrl } from '../../shared/iconSlugs'

type Stage = 'icon' | 'initials'

interface Props {
  name: string
  /** Retained for compatibility with existing callers; unused — logos come
      from the Simple Icons slug map, not from item domains. */
  domain?: string
  /** Our internal item id — looked up in ICON_SLUGS to get an icon spec. */
  itemId?: string
  size: number
  rounded?: number
  /** True when this logo sits on a card whose bg is inverted relative to the
      page theme (e.g. the Entry node in the system diagram). Flips the
      initials tile colors so letters stay readable. */
  inverted?: boolean
}

/**
 * Theme-reactive — subscribes to `class` changes on `<html>` so the initials
 * tile flips live when the user toggles dark mode. Safe during SSR.
 */
function useIsDark(): boolean {
  return useSyncExternalStore(
    onChange => {
      if (typeof document === 'undefined') return () => {}
      const obs = new MutationObserver(onChange)
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      return () => obs.disconnect()
    },
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    () => false,
  )
}

/**
 * Logo rendering strategy:
 *   1. Brand-colored icon — Simple Icons CDN for bare slugs (fill=brand
 *      hex baked in), or Iconify `logos:` / `devicon:` / `arcticons:` pack
 *      for items the direct CDN 404s on.
 *   2. Initials monogram tile (fallback when no slug or icon 404).
 *
 * The logo tile is kept on a solid white background so multi-color brand
 * SVGs have a consistent canvas to render on regardless of theme. A subtle
 * border blends it into either light or dark card bg.
 */
export default function ItemLogo({ name, itemId, size, rounded, inverted = false }: Props) {
  const slug = itemId ? ICON_SLUGS[itemId] : undefined
  const initialStage: Stage = slug ? 'icon' : 'initials'
  const [stage, setStage] = useState<Stage>(initialStage)
  const radius = rounded ?? Math.round(size * 0.22)
  const isDark = useIsDark()

  if (stage === 'initials' || !slug) {
    // Initials tile flips with theme so letters always contrast with the tile.
    // Inverted cards (Entry node) want the opposite treatment.
    const tileIsLight = inverted ? !isDark : isDark
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: radius,
          background: tileIsLight ? '#ffffff' : '#15171a',
          color: tileIsLight ? '#0a0a0a' : '#ffffff',
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

  return (
    <img
      src={iconUrl(slug)}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      crossOrigin="anonymous"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        objectFit: 'contain',
        background: '#ffffff',
        padding: Math.max(2, Math.round(size * 0.08)),
      }}
      onError={() => setStage('initials')}
    />
  )
}
