export type ModeId = 'app' | 'content'

export interface StackItem {
  id: string
  name: string
  /** Short description shown on hover / in prompt */
  blurb?: string
  /** Homepage URL */
  url?: string
}

export interface StackLayer {
  id: string
  name: string
  subtitle: string
  /** If true, item is a single-select style choice (Content Style) vs standard single-pick layer */
  kind?: 'layer' | 'style'
  items: StackItem[]
}

export interface StackMode {
  id: ModeId
  name: string
  tagline: string
  layers: StackLayer[]
}

export type SelectedStack = Record<string, string | null>

export interface SubscribePayload {
  email: string
  action: 'copy_prompt' | 'copy_stack_image' | 'download_png' | 'download_diagram' | 'reset'
  mode: ModeId
  stack: SelectedStack
}
