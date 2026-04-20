import { useState, useSyncExternalStore } from 'react'
import { initialsFor } from '../../shared/icons'
import { ICON_SLUGS } from '../../shared/iconSlugs'

type Stage = 'favicon' | 'simpleicons' | 'initials'

interface Props {
  name: string
  /** The item's canonical domain — used to fetch a Google favicon via our
      Worker proxy. Items without a domain skip straight to the Simple Icons
      (or initials) stage. */
  domain?: string
  /** Our internal item id — looked up in ICON_SLUGS for the fallback stage. */
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

/** Client-side mirror of the Worker's server-side domain validator — keeps
    junk out of the query string before we even hit the network. */
function isValidDomain(d: string | undefined): d is string {
  if (!d || d.length > 253) return false
  if (!/^[a-z0-9.-]+$/i.test(d)) return false
  if (d.startsWith('.') || d.endsWith('.')) return false
  if (d.startsWith('-') || d.endsWith('-')) return false
  if (!d.includes('.')) return false
  if (/^\d+\.\d+\.\d+\.\d+$/.test(d)) return false
  return true
}

function faviconUrl(domain: string): string {
  return `/api/favicon?domain=${encodeURIComponent(domain)}`
}

/** Monochrome Simple Icons. The `/0a0a0a` path segment forces the SVG fill
    to that color. Black on our always-white logo tile reads in both light
    and dark modes — no theme branching needed for the fallback. */
function simpleIconsUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}/0a0a0a`
}

/**
 * Logo rendering strategy:
 *   1. Favicon — Google s2 favicons via our same-origin /api/favicon proxy.
 *      Multi-color, matches how the real brand looks in a browser tab.
 *   2. Simple Icons monochrome fallback — for items without a domain, or
 *      when the favicon 404s. Only runs if ICON_SLUGS has a bare-slug entry
 *      (pack: entries would go to Iconify which is blocked by CSP).
 *   3. Initials — two-char monogram tile, theme-aware.
 *
 * Logo tile stays white with a subtle border in both img stages. Favicons
 * can be transparent or white-bg; the white tile + border guarantees a
 * visible edge regardless of favicon character.
 */
export default function ItemLogo({ name, domain, itemId, size, rounded, inverted = false }: Props) {
  const slug = itemId ? ICON_SLUGS[itemId] : undefined
  const hasFavicon = isValidDomain(domain)
  const hasSlug = typeof slug === 'string' && !slug.includes(':')

  const initialStage: Stage = hasFavicon ? 'favicon' : hasSlug ? 'simpleicons' : 'initials'
  // Reset the stage machine when the slotted item changes — otherwise a
  // previously-fallen-through instance stays stuck on 'initials' when the
  // user picks a different tool in the same layer slot. Using the prev-key
  // render-time pattern avoids the wrong-logo flash that a post-render
  // effect would cause (stale paint → effect → corrected paint).
  const slotKey = `${domain ?? ''}|${slug ?? ''}`
  const [prevSlotKey, setPrevSlotKey] = useState(slotKey)
  const [stage, setStage] = useState<Stage>(initialStage)
  if (prevSlotKey !== slotKey) {
    setPrevSlotKey(slotKey)
    setStage(initialStage)
  }
  const radius = rounded ?? Math.round(size * 0.22)
  const isDark = useIsDark()

  if (stage === 'initials') {
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

  const src =
    stage === 'favicon' ? faviconUrl(domain as string) : simpleIconsUrl(slug as string)

  return (
    <img
      src={src}
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
        border: '1px solid var(--border)',
        padding: Math.max(2, Math.round(size * 0.08)),
        boxSizing: 'border-box',
      }}
      onError={() => {
        if (stage === 'favicon' && hasSlug) setStage('simpleicons')
        else setStage('initials')
      }}
    />
  )
}
