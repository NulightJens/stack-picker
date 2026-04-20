import { memo, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { SelectedStack, StackMode } from '../../shared/types'
import { ENTRY_NODE, tiersFor } from '../../shared/diagram'

interface Props {
  mode: StackMode
  selected: SelectedStack
  /** When `true`, use the compact static layout targeted at PNG export. */
  forExport?: boolean
}

type CardNodeData = {
  layerLabel: string
  itemLabel: string
  initials: string
  isEntry?: boolean
}

type TierNodeData = { label: string }

type AppNode =
  | Node<CardNodeData, 'card'>
  | Node<TierNodeData, 'tier'>

// ---------- Layout math ----------------------------------------------------

const CANVAS_WIDTH = 1400
const CARD_WIDTH = 280
const CARD_HEIGHT = 100
const GAP_X = 18
const TIER_LABEL_HEIGHT = 30
const TIER_V_GAP = 78 // vertical distance from previous tier row bottom to this tier's label
const TOP_PADDING = 40

function buildGraph(mode: StackMode, selected: SelectedStack) {
  const tiers = tiersFor(mode.id)
  const nodes: AppNode[] = []
  const edges: Edge[] = []

  let cursorY = TOP_PADDING

  // Entry node first (App mode only — the "user" isn't a natural frame for content)
  let previousTierNodeIds: string[] = []
  if (mode.id === 'app') {
    const entryX = CANVAS_WIDTH / 2 - CARD_WIDTH / 2
    nodes.push({
      id: '__entry-label__',
      type: 'tier',
      position: { x: entryX, y: cursorY },
      data: { label: 'Entry' },
      draggable: false,
      selectable: false,
    })
    cursorY += TIER_LABEL_HEIGHT
    nodes.push({
      id: ENTRY_NODE.id,
      type: 'card',
      position: { x: entryX, y: cursorY },
      data: { layerLabel: ENTRY_NODE.layerLabel, itemLabel: ENTRY_NODE.itemLabel, initials: '◑', isEntry: true },
      draggable: false,
      selectable: false,
    })
    previousTierNodeIds = [ENTRY_NODE.id]
    cursorY += CARD_HEIGHT
  }

  for (const tier of tiers) {
    const rowNodes: { id: string; layer: string; item: string }[] = []
    for (const layerId of tier.layerIds) {
      const layer = mode.layers.find(l => l.id === layerId)
      if (!layer) continue
      const picked = selected[layerId]
      if (!picked) continue
      const item = layer.items.find(i => i.id === picked)
      if (!item) continue
      rowNodes.push({ id: `card-${layerId}`, layer: layer.name, item: item.name })
    }
    if (rowNodes.length === 0) continue

    // Tier label positioned above the row, centered over the row
    const rowWidth = rowNodes.length * CARD_WIDTH + (rowNodes.length - 1) * GAP_X
    const rowStartX = (CANVAS_WIDTH - rowWidth) / 2
    cursorY += TIER_V_GAP - TIER_LABEL_HEIGHT

    nodes.push({
      id: `tier-${tier.id}`,
      type: 'tier',
      position: { x: rowStartX, y: cursorY },
      data: { label: tier.label },
      draggable: false,
      selectable: false,
    })
    cursorY += TIER_LABEL_HEIGHT

    const rowIds: string[] = []
    rowNodes.forEach((n, idx) => {
      const x = rowStartX + idx * (CARD_WIDTH + GAP_X)
      nodes.push({
        id: n.id,
        type: 'card',
        position: { x, y: cursorY },
        data: { layerLabel: n.layer, itemLabel: n.item, initials: getInitials(n.item) },
        draggable: false,
        selectable: false,
      })
      rowIds.push(n.id)
    })

    // Connect previous tier's "center" node to this tier's "center" node for
    // a clean spine; extra nodes in a tier fan in/out from that center.
    if (previousTierNodeIds.length > 0) {
      const fromCenter = centerOf(previousTierNodeIds)
      const toCenter = centerOf(rowIds)
      edges.push({
        id: `e-${fromCenter}-${toCenter}`,
        source: fromCenter,
        target: toCenter,
        type: 'smoothstep',
        style: { stroke: '#3a3a3a', strokeWidth: 1.5 },
      })
    }
    previousTierNodeIds = rowIds
    cursorY += CARD_HEIGHT
  }

  const canvasHeight = cursorY + TOP_PADDING
  return { nodes, edges, canvasHeight }
}

function centerOf(ids: string[]): string {
  return ids[Math.floor(ids.length / 2)]
}

function getInitials(name: string): string {
  const cleaned = name.replace(/[()]/g, '').trim()
  const words = cleaned.split(/[\s/.-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// ---------- Custom node renderers -----------------------------------------

const CardNode = memo(function CardNode({ data }: NodeProps<Node<CardNodeData, 'card'>>) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        borderRadius: 14,
        background: data.isEntry ? '#ffffff' : '#141414',
        border: data.isEntry ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
        color: data.isEntry ? '#0a0a0a' : '#fafafa',
      }}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <div
        style={{
          flexShrink: 0,
          width: 56,
          height: 56,
          borderRadius: 12,
          background: data.isEntry ? '#0a0a0a' : '#ffffff',
          color: data.isEntry ? '#ffffff' : '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: data.initials.length > 1 ? 18 : 24,
          fontWeight: 800,
        }}
      >
        {data.initials}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: data.isEntry ? '#666' : '#888',
            marginBottom: 2,
          }}
        >
          {data.layerLabel}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.itemLabel}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
})

const TierNode = memo(function TierNode({ data }: NodeProps<Node<TierNodeData, 'tier'>>) {
  return (
    <div
      style={{
        height: TIER_LABEL_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#666',
        pointerEvents: 'none',
      }}
    >
      {data.label}
    </div>
  )
})

const HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  border: 'none',
  background: 'transparent',
  pointerEvents: 'none',
}

const nodeTypes = { card: CardNode, tier: TierNode }

// ---------- Public component ----------------------------------------------

/**
 * Renders the stack as a system-design flowchart. The off-screen export path
 * ([DiagramExport.tsx]) renders this at a fixed size and screenshots it.
 */
export default function DiagramCanvas({ mode, selected, forExport }: Props) {
  const { nodes, edges, canvasHeight } = useMemo(() => buildGraph(mode, selected), [mode, selected])

  return (
    <div
      style={{
        width: CANVAS_WIDTH,
        height: canvasHeight,
        background: '#0a0a0a',
        position: 'relative',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={1}
        maxZoom={1}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        {!forExport && <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#222" />}
      </ReactFlow>
    </div>
  )
}

export const DIAGRAM_WIDTH = CANVAS_WIDTH
