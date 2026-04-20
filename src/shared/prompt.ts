import type { SelectedStack, StackMode } from './types'

/**
 * Build a copy-paste prompt for an AI coding environment (Claude / ChatGPT /
 * Cursor / Windsurf). Opening paragraph is a strong, task-shaped instruction;
 * the stack is a modular bulleted list built from the user's selections.
 */
export function buildPrompt(mode: StackMode, selected: SelectedStack): string {
  const picks: { layer: string; item: string }[] = []
  for (const layer of mode.layers) {
    const id = selected[layer.id]
    if (!id) continue
    const item = layer.items.find(i => i.id === id)
    if (!item) continue
    picks.push({ layer: layer.name, item: item.name })
  }

  if (picks.length === 0) {
    return 'No stack selected yet — pick at least one layer before copying the prompt.'
  }

  const intro = mode.id === 'app' ? APP_INTRO : CONTENT_INTRO
  const closer = mode.id === 'app' ? APP_CLOSER : CONTENT_CLOSER

  const lines: string[] = []
  lines.push(intro)
  lines.push('')
  for (const p of picks) {
    lines.push(`- ${p.layer}: ${p.item}`)
  }
  lines.push('')
  lines.push(closer)
  return lines.join('\n')
}

const APP_INTRO =
  'Use the following tech stack to design the system architecture. Explain how the pieces connect, what each one is responsible for, and any tradeoffs or gotchas I should know about.'

const APP_CLOSER =
  "Then outline the folder structure, the core packages to install, the environment variables I'll need, and the first five concrete tasks to get a deployable skeleton running. Be opinionated — if a pick is weak for this combination, say so and suggest the closest better alternative."

const CONTENT_INTRO =
  'Use the following content stack to design a weekly content operation. Explain how the pieces connect, what each one is responsible for in the pipeline, and any tradeoffs or gotchas I should know about.'

const CONTENT_CLOSER =
  'Then give me a weekly workflow (ideation → publish → measure), a realistic publishing cadence for a solo operator, and the first three pieces of content to ship. Be opinionated — if a pick is weak for the chosen style, say so and suggest a better alternative.'
