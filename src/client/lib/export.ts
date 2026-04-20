import { toBlob } from 'html-to-image'
import type { SelectedStack, StackMode } from '../../shared/types'
import { buildPrompt } from '../../shared/prompt'

export async function copyPromptToClipboard(mode: StackMode, selected: SelectedStack) {
  const text = buildPrompt(mode, selected)
  await navigator.clipboard.writeText(text)
}

/**
 * Render a node to a PNG blob. html-to-image throws a CORS SecurityError when
 * it tries to inline cross-origin stylesheets (e.g. Google Fonts); once that
 * path throws, the whole render aborts. Retry without font embedding — the
 * PNG loses its font-face definitions but the browser's system fallback
 * stack picks a close enough match for export purposes.
 */
async function renderPng(node: HTMLElement): Promise<Blob> {
  try {
    const blob = await toBlob(node, { cacheBust: true, pixelRatio: 2 })
    if (blob) return blob
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[export] full render failed, retrying without fonts', err)
  }
  const fallback = await toBlob(node, { cacheBust: true, pixelRatio: 2, skipFonts: true })
  if (!fallback) throw new Error('Could not render image')
  return fallback
}

/**
 * iOS Safari consumes user-activation on the first `await` after a user
 * gesture. If we render the blob first and THEN call clipboard.write, the
 * write fails silently because activation has expired. The workaround —
 * documented by WebKit — is to pass a Promise<Blob> into ClipboardItem so the
 * async rendering happens inside the clipboard write, not before it.
 */
export async function copyStackImage(node: HTMLElement) {
  const supportsClipboardImage =
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function' &&
    (typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports('image/png'))

  if (supportsClipboardImage) {
    const blobPromise = renderPng(node)
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })])
      return
    } catch {
      // Fall through to download — e.g. macOS Firefox, locked-down contexts.
    }
  }

  downloadBlob(await renderPng(node), 'stack.png')
}

/** Render a DOM node to PNG and trigger a file download. */
export async function downloadPng(node: HTMLElement, filename = 'stack.png'): Promise<void> {
  downloadBlob(await renderPng(node), filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
