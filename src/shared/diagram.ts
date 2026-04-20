import type { ModeId } from './types'

/**
 * A "tier" is a horizontal row in the system-design diagram. Each tier has a
 * group label (shown above the row) and the layer ids that belong in it, in
 * left-to-right order. Unselected layers are skipped at render time.
 */
export interface DiagramTier {
  id: string
  label: string
  /** Layer ids belonging to this tier */
  layerIds: string[]
}

/** Synthetic "entry point" node prepended to every App-mode diagram. */
export const ENTRY_NODE = {
  id: '__entry__',
  layerLabel: 'Entry Point',
  itemLabel: 'User · Browser',
}

const APP_TIERS: DiagramTier[] = [
  { id: 'hosting', label: 'Hosting / Compute', layerIds: ['hosting'] },
  { id: 'frontend', label: 'Frontend', layerIds: ['frontend', 'styling'] },
  { id: 'backend', label: 'Backend Runtime', layerIds: ['backend'] },
  { id: 'identity', label: 'Identity & Storage', layerIds: ['auth', 'storage'] },
  { id: 'services', label: 'External Services', layerIds: ['email', 'payments', 'ai', 'search', 'cms'] },
  { id: 'data', label: 'Data Layer', layerIds: ['orm'] },
  { id: 'persistence', label: 'Persistence', layerIds: ['database'] },
  { id: 'delivery', label: 'Observability & Delivery', layerIds: ['monitoring', 'product-analytics', 'web-analytics', 'cicd'] },
]

const CONTENT_TIERS: DiagramTier[] = [
  { id: 'style', label: 'Style', layerIds: ['style'] },
  { id: 'ideation', label: 'Ideation', layerIds: ['ideation'] },
  { id: 'creation', label: 'Creation', layerIds: ['scripting', 'voice', 'editing', 'thumbnails'] },
  { id: 'platforms', label: 'Platforms', layerIds: ['shortform', 'longform'] },
  { id: 'distribution', label: 'Distribution', layerIds: ['scheduling'] },
  { id: 'measurement', label: 'Measurement & Audience', layerIds: ['analytics', 'community', 'monetization'] },
]

export function tiersFor(mode: ModeId): DiagramTier[] {
  return mode === 'content' ? CONTENT_TIERS : APP_TIERS
}
