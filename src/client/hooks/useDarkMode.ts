import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'stack-picker:dark'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored != null) return stored === '1'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Single shared source of truth. Per-instance useState meant only the caller
// that owned the toggle stayed in sync; any other consumer of dark mode kept
// its page-load value and drifted. A module-level store with subscriptions
// keeps every consumer in lockstep and gives one owner of the <html> class +
// localStorage.
let dark = readInitial()
const listeners = new Set<() => void>()

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', dark)
}

function setDark(next: boolean) {
  if (next === dark) return
  dark = next
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0')
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useDarkMode(): [boolean, () => void] {
  const value = useSyncExternalStore(subscribe, () => dark, () => false)
  return [value, () => setDark(!dark)]
}
