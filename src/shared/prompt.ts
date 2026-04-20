import type { SelectedStack, StackMode } from './types'

/** Build a copy-paste prompt describing the selected stack. */
export function buildPrompt(mode: StackMode, selected: SelectedStack): string {
  const lines: string[] = []
  lines.push(`I'm building a new project. Here's my ${mode.name.toLowerCase()}:\n`)

  let any = false
  for (const layer of mode.layers) {
    const id = selected[layer.id]
    if (!id) continue
    const item = layer.items.find(i => i.id === id)
    if (!item) continue
    any = true
    lines.push(`- **${layer.name}**: ${item.name}`)
  }

  if (!any) {
    return 'No stack selected yet.'
  }

  lines.push('')
  lines.push(
    mode.id === 'app'
      ? 'Help me scaffold this. Suggest folder structure, core packages, and the first 5 things to build.'
      : 'Help me build a content operation on this stack. Suggest a weekly workflow, a publishing cadence, and the first 3 pieces to ship.',
  )
  return lines.join('\n')
}
