import { useRef, useState } from 'react'
import Nav from './components/Nav'
import LayerCard from './components/LayerCard'
import BottomBar, { type BottomAction } from './components/BottomBar'
import EmailModal from './components/EmailModal'
import StackSummary from './components/StackSummary'
import { useDarkMode } from './hooks/useDarkMode'
import { useStack } from './hooks/useStack'
import { getMode } from '../shared/data'
import { getStoredEmail, setStoredEmail, subscribe } from './lib/api'
import { copyPromptToClipboard, copyStackImage, downloadDiagramMarkdown, downloadPng } from './lib/export'

const ACTION_CTA: Record<BottomAction, string> = {
  copy_prompt: 'Copy prompt',
  copy_stack_image: 'Copy stack image',
  download_png: 'Download PNG',
  download_diagram: 'Download diagram',
  reset: 'Reset my stack',
}

export default function App() {
  const [dark, toggleDark] = useDarkMode()
  const { mode, selected, setMode, toggle, reset, pickedCount } = useStack()
  const modeData = getMode(mode)
  const exportRef = useRef<HTMLDivElement>(null)

  const [pendingAction, setPendingAction] = useState<BottomAction | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const executeAction = async (action: BottomAction) => {
    const node = exportRef.current
    try {
      if (action === 'copy_prompt') {
        await copyPromptToClipboard(modeData, selected)
        showToast('Prompt copied to clipboard')
      } else if (action === 'copy_stack_image' && node) {
        await copyStackImage(node)
        showToast('Stack image copied')
      } else if (action === 'download_png' && node) {
        await downloadPng(node, `${mode}-stack.png`)
        showToast('PNG downloaded')
      } else if (action === 'download_diagram') {
        downloadDiagramMarkdown(modeData, selected, `${mode}-stack.md`)
        showToast('Diagram downloaded')
      } else if (action === 'reset') {
        reset()
        showToast('Stack cleared')
      }
    } catch (err: any) {
      showToast(err?.message || 'Something went wrong')
    }
  }

  const handleAction = (action: BottomAction) => {
    // Reset doesn't gate, but per user spec every bottom action gates.
    // Still: if user already gave email this session, skip modal.
    const stored = getStoredEmail()
    if (stored) {
      void executeAction(action)
      return
    }
    setPendingAction(action)
  }

  const handleEmailSubmit = async (email: string) => {
    const action = pendingAction
    if (!action) return
    await subscribe({ email, action, mode, stack: selected })
    setStoredEmail(email)
    setPendingAction(null)
    void executeAction(action)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav mode={mode} onModeChange={setMode} dark={dark} onToggleDark={toggleDark} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            2026 {modeData.name === 'App Stack' ? 'Development Tools' : 'Content Operation'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm sm:text-base">{modeData.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] justify-center">
            <Pill>Single click to select</Pill>
            <Pill>Click again to deselect</Pill>
            <Pill>Selections appear in the bottom bar</Pill>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modeData.layers.map(layer => (
            <LayerCard
              key={layer.id}
              layer={layer}
              selectedItemId={selected[layer.id]}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* Off-screen export target */}
        <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
          <div ref={exportRef}>
            <StackSummary mode={modeData} selected={selected} />
          </div>
        </div>
      </main>

      <BottomBar mode={modeData} selected={selected} pickedCount={pickedCount} onAction={handleAction} />

      <EmailModal
        open={!!pendingAction}
        ctaLabel={pendingAction ? ACTION_CTA[pendingAction] : 'Continue'}
        onSubmit={handleEmailSubmit}
        onDismiss={() => setPendingAction(null)}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-[var(--cta)] text-[var(--cta-text)] text-xs font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
      {children}
    </span>
  )
}
