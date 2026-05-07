import { useState, useSyncExternalStore } from 'react'
import { initialsFor } from '../../shared/icons'
import { THESVG_SLUGS, thesvgUrl } from '../../shared/iconSlugs'

type Stage = 'thesvg' | 'favicon' | 'initials'

interface Props {
  name: string
  /** The item's canonical domain — used to fetch a Google favicon via our
      Worker proxy as the fallback when theSVG doesn't carry the brand. */
  domain?: string
  /** Our internal item id — looked up in THESVG_SLUGS for the primary stage. */
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

/**
 * Logo rendering strategy:
 *   1. theSVG — full-color brand SVG from `https://thesvg.org/icons/<slug>/default.svg`.
 *      Covers ~82% of items (the rest fall through to favicon).
 *   2. Favicon — Google s2 favicons via our same-origin /api/favicon proxy.
 *      Catches the ~25 brands theSVG doesn't carry (Skool, Beehiiv, Descript,
 *      Apify, etc.) and is same-origin so it embeds cleanly in PNG exports.
 *   3. Initials — two-char monogram tile, theme-aware.
 *
 * Logo tile stays white with a subtle border in both img stages so brand
 * colors and transparent favicons both have a visible edge.
 */
export default function ItemLogo({ name, domain, itemId, size, rounded, inverted = false }: Props) {
  const slug = itemId ? THESVG_SLUGS[itemId] : undefined
  const hasSlug = typeof slug === 'string' && slug.length > 0
  const hasFavicon = isValidDomain(domain)

  const initialStage: Stage = hasSlug ? 'thesvg' : hasFavicon ? 'favicon' : 'initials'
  // Reset the stage machine when the slotted item changes — otherwise a
  // previously-fallen-through instance stays stuck on 'initials' when the
  // user picks a different tool in the same layer slot. Using the prev-key
  // render-time pattern avoids the wrong-logo flash that a post-render
  // effect would cause (stale paint → effect → corrected paint).
  const slotKey = `${domain ?? ''}|${slug ?? ''}`
  const [prevSlotKey, setPrevSlotKey] = useState(slotKey)
  const [stage, setStage] = useState<Stage>(initialStage)
  // When the slot changes, useState still returns the previous value for the
  // current render — only subsequent renders see the reset. Use `initialStage`
  // for this render so we don't dereference a stage that no longer matches the
  // item (e.g. stage='thesvg' when the new item has no slug → undefined deref).
  const effectiveStage = prevSlotKey !== slotKey ? initialStage : stage
  if (prevSlotKey !== slotKey) {
    setPrevSlotKey(slotKey)
    setStage(initialStage)
  }
  const radius = rounded ?? Math.round(size * 0.22)
  const isDark = useIsDark()

  if (effectiveStage === 'initials') {
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
    effectiveStage === 'thesvg' ? thesvgUrl(slug as string) : faviconUrl(domain as string)

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
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
        if (effectiveStage === 'thesvg' && hasFavicon) setStage('favicon')
        else setStage('initials')
      }}
    />
  )
}
