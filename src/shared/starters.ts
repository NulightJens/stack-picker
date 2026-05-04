import type { SelectedStack } from './types'

export interface Starter {
  id: string
  name: string
  tagline: string
  /** Subset of picks (item ids) to render as favicon chips on the card. 6-8 items. */
  highlight: string[]
  /** Full layer-id -> item-id map. Must cover every App Stack layer. */
  picks: Record<string, string>
}

export const STARTERS: Starter[] = [
  {
    id: 'cloudflare',
    name: 'The Cloudflare Stack',
    tagline: 'One bill, edge-first, low-config.',
    highlight: ['astro', 'hono', 'cloudflare-pages', 'd1', 'r2', 'drizzle', 'better-auth'],
    picks: {
      frontend: 'astro',
      styling: 'tailwind',
      backend: 'hono',
      hosting: 'cloudflare-pages',
      database: 'd1',
      orm: 'drizzle',
      auth: 'better-auth',
      storage: 'r2',
      monitoring: 'axiom',
      'product-analytics': 'posthog',
      'web-analytics': 'cf-analytics',
      email: 'resend',
      payments: 'stripe',
      ai: 'anthropic',
      search: 'typesense',
      cms: 'mdx',
      cicd: 'gh-actions',
    },
  },
  {
    id: 'vercel-supabase',
    name: 'The Vercel + Supabase Stack',
    tagline: 'The default 2026 indie SaaS combo.',
    highlight: ['nextjs', 'shadcn', 'vercel', 'supabase', 'drizzle', 'sanity', 'supabase-auth'],
    picks: {
      frontend: 'nextjs',
      styling: 'shadcn',
      backend: 'nodejs',
      hosting: 'vercel',
      database: 'supabase',
      orm: 'drizzle',
      auth: 'supabase-auth',
      storage: 'supabase-storage',
      monitoring: 'sentry',
      'product-analytics': 'posthog',
      'web-analytics': 'vercel-analytics',
      email: 'resend',
      payments: 'stripe',
      ai: 'openai',
      search: 'algolia',
      cms: 'sanity',
      cicd: 'vercel-deploys',
    },
  },
  {
    id: 'postgres-power',
    name: 'The Postgres Power Stack',
    tagline: 'Cheap, boring, scales.',
    highlight: ['remix', 'railway', 'neon', 'prisma', 'clerk', 'payload', 'postgres-fts'],
    picks: {
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
      ai: 'anthropic',
      search: 'postgres-fts',
      cms: 'payload',
      cicd: 'gh-actions',
    },
  },
]

// `SelectedStack` is `Record<string, string | null>` (a layer can be empty).
// `Starter['picks']` is `Record<string, string>` (every layer must be set).
// Callers of `applyStarter` widen the no-null map into a SelectedStack at the
// assignment site; we deliberately keep the no-null type here so the data is
// self-validating.
export type { SelectedStack }
