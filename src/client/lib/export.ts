import { toPng, toBlob } from 'html-to-image'
import type { SelectedStack, StackMode } from '../../shared/types'
import { buildPrompt } from '../../shared/prompt'

export async function copyPromptToClipboard(mode: StackMode, selected: SelectedStack) {
  const text = buildPrompt(mode, selected)
  await navigator.clipboard.writeText(text)
}

export async function copyStackImage(node: HTMLElement) {
  const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2 })
  if (!blob) throw new Error('Could not render image')
  // Some browsers require ClipboardItem
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return
  }
  // Fallback: trigger download
  downloadBlob(blob, 'stack.png')
}

export async function downloadPng(node: HTMLElement, filename = 'stack.png') {
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function downloadDiagramMarkdown(mode: StackMode, selected: SelectedStack, filename = 'stack.md') {
  const lines: string[] = []
  lines.push(`# My 2026 ${mode.name}`)
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart TB')
  lines.push(`  root["My ${mode.name}"]`)
  mode.layers.forEach((layer, idx) => {
    const pick = selected[layer.id]
    if (!pick) return
    const item = layer.items.find(i => i.id === pick)
    if (!item) return
    const nodeId = `n${idx}`
    lines.push(`  root --> ${nodeId}["${layer.name}: ${item.name}"]`)
  })
  lines.push('```')
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
