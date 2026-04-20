import { toBlob } from 'html-to-image'
import type { SelectedStack, StackMode } from '../../shared/types'
import { buildPrompt } from '../../shared/prompt'

export async function copyPromptToClipboard(mode: StackMode, selected: SelectedStack) {
  const text = buildPrompt(mode, selected)
  await navigator.clipboard.writeText(text)
}

export async function copyStackImage(node: HTMLElement) {
  const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2 })
  if (!blob) throw new Error('Could not render image')
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return
  }
  downloadBlob(blob, 'stack.png')
}

/** Render a DOM node to PNG and trigger a file download. */
export async function downloadPng(node: HTMLElement, filename = 'stack.png'): Promise<void> {
  const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2 })
  if (!blob) throw new Error('Could not render image')
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
