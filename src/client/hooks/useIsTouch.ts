import { useSyncExternalStore } from 'react'

/**
 * True when the primary pointer is coarse/untouched by hover.
 * Updates live — e.g. when a user hot-plugs a mouse on an iPad.
 *
 * `(hover: none)` is the disjoint complement of `(hover: hover) and
 * (pointer: fine)` — the two media queries never both match, so the
 * BottomBar can safely branch on this boolean without a third case.
 */
const QUERY = '(hover: none)'

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
