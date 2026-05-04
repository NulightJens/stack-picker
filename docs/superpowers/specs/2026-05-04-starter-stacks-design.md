# Starter Stacks — Design

**Date:** 2026-05-04
**Status:** Approved (verbal, see brainstorming transcript)
**Scope:** App Stack only. No content-mode equivalent in this iteration.

## Intent

Cold visitors land on Stack Picker with no opinion. Today they have to read 17 layer cards, compare items they've never heard of, and assemble something from scratch. **Starter Stacks** removes that cold-start by offering 3 prominent, hand-picked combinations — one click populates every layer, and the user can still tweak any pick afterward.

This is a top-of-funnel discovery surface. No email gate (the gate stays on export actions). The pre-filled stack still needs to flow through the existing Copy-prompt / Copy-image / Download paths.

## What we're building

### Three starter stacks

| Starter | Tagline | Distinct on |
|---|---|---|
| The Cloudflare Stack | One bill, edge-first, low-config. | Astro · Hono · Workers · D1 · R2 · Drizzle · Better Auth |
| The Vercel + Supabase Stack | The default 2026 indie SaaS combo. | Next.js · shadcn · Vercel · Supabase · Drizzle · Sanity |
| The Postgres Power Stack | Cheap, boring, scales. | Remix · Railway · Neon · Prisma · Clerk · Payload |

Per-layer picks (all `id` strings reference items in `src/shared/data.ts`):

#### The Cloudflare Stack (`cloudflare`)

```ts
{
  frontend: 'astro',
  styling: 'tailwind',
  backend: 'hono',
  hosting: 'cloudflare-pages',   // newly added
  database: 'd1',
  orm: 'drizzle',
  auth: 'better-auth',
  storage: 'r2',
  monitoring: 'axiom',
  'product-analytics': 'posthog',
  'web-analytics': 'cf-analytics',
  email: 'resend',
  payments: 'stripe',
  'ai-llm': 'anthropic',
  search: 'typesense',
  cms: 'mdx',
  'ci-cd': 'gh-actions',
}
```

#### The Vercel + Supabase Stack (`vercel-supabase`)

```ts
{
  frontend: 'nextjs',
  styling: 'shadcn',
  backend: 'nodejs',
  hosting: 'vercel',
  database: 'supabase',
  orm: 'drizzle',
  auth: 'supabase-auth',
  storage: 'supabase-storage',   // newly added
  monitoring: 'sentry',
  'product-analytics': 'posthog',
  'web-analytics': 'vercel-analytics',
  email: 'resend',
  payments: 'stripe',
  'ai-llm': 'openai',
  search: 'algolia',
  cms: 'sanity',
  'ci-cd': 'vercel-deploys',
}
```

#### The Postgres Power Stack (`postgres-power`)

```ts
{
  frontend: 'remix',
  styling: 'tailwind',
  backend: 'nodejs',
  hosting: 'railway',
  database: 'neon',
  orm: 'prisma',
  auth: 'clerk',
  storage: 's3',
  monitoring: 'better-stack',
  'product-analytics': 'posthog',
  'web-analytics': 'plausible',
  email: 'resend',
  payments: 'stripe',
  'ai-llm': 'anthropic',
  search: 'postgres-fts',
  cms: 'payload',
  'ci-cd': 'gh-actions',
}
```

> Layer ids match `src/shared/data.ts` exactly (verified in inventory pass).

### `data.ts` additions

Two missing items that the starters need:

- `Storage` layer → `{ id: 'supabase-storage', name: 'Supabase Storage', domain: 'supabase.com' }`
- `Hosting` layer → `{ id: 'cloudflare-pages', name: 'Cloudflare Pages', domain: 'cloudflare.com' }`

No other items added or removed in this iteration.

## Architecture

### Files

| File | Action | Purpose |
|---|---|---|
| `src/shared/data.ts` | Edit | Add `supabase-storage`, `cloudflare-pages`. |
| `src/shared/starters.ts` | New | Export `STARTERS` constant + `Starter` type. App-mode only. |
| `src/client/components/StarterStacks.tsx` | New | Row of 3 cards above LayerCards. Calls `applyStarter`. |
| `src/client/hooks/useStack.ts` | Edit | Add `applyStarter(picks)` and derive `activeStarterId`. |
| `src/client/App.tsx` | Edit | Mount `<StarterStacks>` between hero copy and LayerCards grid, App-mode only. |

No new dependencies. No CSP changes (favicons already covered). No D1 / API surface change.

### Data shape

```ts
// src/shared/starters.ts
export interface Starter {
  id: string                          // 'cloudflare' | 'vercel-supabase' | 'postgres-power'
  name: string                        // display name
  tagline: string                     // ≤ 60 chars
  picks: Record<string, string>       // layerId -> itemId (all 17 layers required)
}

export const STARTERS: Starter[]      // length 3, app-mode only
```

`applyStarter` semantics:

- Replaces `state.app` wholesale with the starter's picks (no merge).
- Persists immediately via the existing `useEffect` localStorage write.
- Always operates on app mode (the only mode that has starters).

`activeStarterId` semantics:

- Pure derivation from `selected` vs each starter's picks.
- A starter is active iff every layer-id key matches and no extra keys exist.
- Returns `null` when picks diverge or when fewer than 17 picks are made.
- Used by `StarterStacks` to apply the accent ring on the active card.

### Component behavior

**StarterStacks** (`src/client/components/StarterStacks.tsx`):

- Renders nothing if `mode !== 'app'`.
- 3-card row: `grid-cols-1 md:grid-cols-3 gap-4`.
- Each card:
  - **Header**: starter name (Manrope 800), tagline (text-secondary).
  - **Body**: 6-8 favicon chips (use `ItemLogo` for consistency) showing the most distinctive picks for that starter. Picked subset is hardcoded per starter so it's curated, not auto-derived.
  - **Footer**: "Use this stack" button (primary CTA tone).
- Active starter (`id === activeStarterId`) gets `ring-2 ring-[var(--accent)]` and a subtle "Active" pill in the header.
- Click card or button → `applyStarter(starter.picks)` → smooth scroll to first LayerCard (`window.scrollTo({ top: layersTop, behavior: 'smooth' })`).
- Keyboard: card is `role="button"`, `tabIndex={0}`, Enter/Space activates.

### Visual placement

Above LayerCards grid, below the existing hero block in `App.tsx`. Adds one block to `<main>`:

```
<main>
  <hero> ... existing ... </hero>
  <StarterStacks />               ← new
  <div className="grid ..."> ... LayerCards ... </div>
  <off-screen export targets />
</main>
```

Spacing: `mb-8 sm:mb-12` between StarterStacks and the LayerCards grid (matches existing rhythm).

### Out of scope

- Content-mode starters.
- "Custom starter" save flow (parked under Stack Library in CONTEXT.md § 5).
- Per-layer "skip" markers (every starter fills all 17 layers).
- An `AI Coding Tool` layer (Claude Code / Cursor / Codex) — explicitly skipped per user direction; the stacks are tool-agnostic.

## Error handling

- `applyStarter` is a synchronous state replace; no failure mode.
- If `data.ts` ever drops an item that a starter references, the picker still renders — the unmatched id will display as an unselected layer when the user opens it (verify in typecheck via id literal types is out of scope; runtime degrades gracefully).
- Smooth scroll uses `behavior: 'smooth'` and is a no-op when reduced-motion is set (browser-native).

## Testing

- `npm run typecheck` clean.
- `npm run build` clean (bundle size delta should be < 2kb gzipped — three small data objects + one component).
- Per user preference (`feedback_no-browser-driven-testing.md`): static checks only; user verifies on real device after deploy.

## Sequencing

1. Add `supabase-storage` + `cloudflare-pages` to `data.ts`.
2. Write `src/shared/starters.ts` (data only — no hook or UI yet).
3. Extend `useStack` with `applyStarter` + `activeStarterId`.
4. Build `StarterStacks` component.
5. Mount in `App.tsx`.
6. Typecheck + build. Hand off to user for visual verification + deploy.

Each step lands as its own commit (per `~/CLAUDE.md` "split commits by concern").
