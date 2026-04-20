import { toBlob } from 'html-to-image'
import type { SelectedStack, StackMode } from '../../shared/types'
import { buildPrompt } from '../../shared/prompt'

export async function copyPromptToClipboard(mode: StackMode, selected: SelectedStack) {
  const text = buildPrompt(mode, selected)
  await navigator.clipboard.writeText(text)
}

/**
 * Render a node to a PNG blob.
 *
 * html-to-image walks every <link rel="stylesheet"> on the page to inline
 * @font-face rules. Google Fonts is cross-origin, so reading .cssRules throws
 * SecurityError and aborts the whole render. Passing an empty `fontEmbedCSS`
 * short-circuits the font-parsing path entirely — the exported PNG uses the
 * element's resolved font stack (Manrope → system-ui fallback), which is
 * fine for the PNG at the sizes we export.
 *
 * `skipFonts: true` exists in html-to-image's types but the current release
 * still enters the CSS parser; `fontEmbedCSS: ''` is the reliable escape
 * hatch across versions.
 */
async function renderPng(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    fontEmbedCSS: '',
  })
  if (!blob) throw new Error('Could not render image')
  return blob
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
