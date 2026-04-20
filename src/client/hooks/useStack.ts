import { useCallback, useEffect, useState } from 'react'
import type { ModeId, SelectedStack } from '../../shared/types'

const STORAGE_KEY = 'stack-picker:state:v1'

interface PersistedState {
  mode: ModeId
  app: SelectedStack
  content: SelectedStack
}

function load(): PersistedState {
  if (typeof window === 'undefined') return { mode: 'app', app: {}, content: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { mode: 'app', app: {}, content: {} }
    const parsed = JSON.parse(raw) as PersistedState
    return {
      mode: parsed.mode === 'content' ? 'content' : 'app',
      app: parsed.app ?? {},
      content: parsed.content ?? {},
    }
  } catch {
    return { mode: 'app', app: {}, content: {} }
  }
}

export function useStack() {
  const [state, setState] = useState<PersistedState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const selected = state[state.mode]

  const setMode = useCallback((mode: ModeId) => {
    setState(s => ({ ...s, mode }))
  }, [])

  const toggle = useCallback((layerId: string, itemId: string) => {
    setState(s => {
      const current = s[s.mode][layerId]
      const next = current === itemId ? null : itemId
      return { ...s, [s.mode]: { ...s[s.mode], [layerId]: next } }
    })
  }, [])

  const reset = useCallback(() => {
    setState(s => ({ ...s, [s.mode]: {} }))
  }, [])

  const pickedCount = Object.values(selected).filter(Boolean).length

  return { mode: state.mode, selected, setMode, toggle, reset, pickedCount }
}
