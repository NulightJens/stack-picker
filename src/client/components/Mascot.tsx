import { useEffect, useRef, useState } from 'react'

// The Jens AI squid — real animated APNG (never redraw/recolor/filter, §1.8).
// Floats idle, waves on hover/focus; reduced-motion freezes it to a still frame.
// Source aspect ratio is 160×150.
const FLOAT = '/mascot/floating.apng'
const WAVE = '/mascot/waving.apng'
const STILL = '/mascot/squid.png'
const RATIO = 150 / 160

interface Props {
  /** Rendered width in px (height derives from the 160×150 source). */
  size?: number
  className?: string
  /** Accessible label; pass "" for a purely decorative instance. */
  alt?: string
}

export default function Mascot({ size = 72, className = '', alt = 'Jens AI squid mascot' }: Props) {
  const [hovered, setHovered] = useState(false)
  const [reduced, setReduced] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const src = reduced ? STILL : hovered ? WAVE : FLOAT

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={size}
      height={Math.round(size * RATIO)}
      className={`pixelated select-none ${className}`}
      draggable={false}
      onMouseEnter={() => !reduced && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => !reduced && setHovered(true)}
      onBlur={() => setHovered(false)}
    />
  )
}
