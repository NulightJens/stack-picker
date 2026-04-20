import { useState, useSyncExternalStore } from 'react'
import { initialsFor } from '../../shared/icons'
import { ICON_SLUGS, iconUrl } from '../../shared/iconSlugs'

type Stage = 'simpleicons' | 'initials'

interface Props {
  name: string
  /** Retained for compatibility with existing callers; unused — logos come
      from the Simple Icons slug map, not from item domains. */
  domain?: string
  /** Our internal item id — looked up in ICON_SLUGS to get a Simple Icons slug. */
  itemId?: string
  size: number
  rounded?: number
  /** True when this logo sits on a card whose bg is inverted relative to the
      page theme (e.g. the Entry node in the system diagram). Flips the tile
      colors so the logo always contrasts with its immediate surface. */
  inverted?: boolean
}

/**
 * Theme-reactive — subscribes to `class` changes on `<html>` so the logo
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
 *   1. Simple Icons CDN (clean monochrome brand SVG) — CORS-clean, exports
 *      cleanly to PNG because html-to-image can fetch it without taint.
 *   2. Initials monogram tile (fallback for items with no slug or a 404).
 *
 * Tile colors track the current theme via `useIsDark()` so the same component
 * renders cleanly in both light and dark exports. The logo SVG is forced to a
 * monochrome hex that contrasts with the tile, which also matches the site's
 * editorial monochrome aesthetic (brand colors were never a goal).
 */
export default function ItemLogo({ name, itemId, size, rounded, inverted = false }: Props) {
  const slug = itemId ? ICON_SLUGS[itemId] : undefined
  const initialStage: Stage = slug ? 'simpleicons' : 'initials'
  const [stage, setStage] = useState<Stage>(initialStage)
  const radius = rounded ?? Math.round(size * 0.22)
  const isDark = useIsDark()

  // Regular cards track page theme; inverted cards flip vs page.
  // The tile should always be the inverse of its card so the logo stands out.
  //   - dark mode, not inverted: card dark → tile light
  //   - dark mode, inverted    : card light → tile dark
  //   - light mode, not inverted: card light → tile dark
  //   - light mode, inverted   : card dark → tile light
  const tileIsLight = inverted ? !isDark : isDark
  const tileBg = tileIsLight ? '#ffffff' : '#15171a'
  const tileFg = tileIsLight ? '#0a0a0a' : '#ffffff'
  // Simple Icons CDN accepts `/<slug>/<hex>` to force the icon color — we strip
  // the leading `#` so both 6-char and plain strings work.
  const iconHex = tileIsLight ? '0a0a0a' : 'ffffff'

  if (stage === 'initials' || !slug) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: radius,
          background: tileBg,
          color: tileFg,
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
      src={iconUrl(slug, iconHex)}
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
        background: tileBg,
        padding: Math.max(2, Math.round(size * 0.08)),
      }}
      onError={() => setStage('initials')}
    />
  )
}
