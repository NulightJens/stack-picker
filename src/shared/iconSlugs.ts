/**
 * Maps our internal item ids to theSVG icon paths (https://thesvg.org).
 *
 * Value format:
 *   - `"slug"`           → uses the `default` variant
 *   - `"slug/variant"`   → uses an explicit variant (e.g. `vercel/light`)
 *
 * The CDN URL is `https://thesvg.org/icons/<slug>/<variant>.svg`. Variants
 * picked at build time (see `/tmp/thesvg-audit/audit.py`) to avoid two failure
 * modes on our white logo tile:
 *
 *   1. Wide wordmark — `default` is a logotype that shrinks illegibly in a
 *      square tile. Substitutes: `color` (square + brand color) or `mono`
 *      (square monochrome).
 *   2. White-on-white — `default` is the dark-bg version with `fill="#fff"`
 *      that disappears on our white tile. Substitute: `light` (the variant
 *      designed for *light* backgrounds, with dark fills) or `mono`.
 *
 * Items NOT listed here fall through to the favicon stage (then initials)
 * in `ItemLogo.tsx`. ~25 brands theSVG doesn't carry — Skool, Beehiiv,
 * Descript, Apify, Together AI, Fly.io, etc. — rely on the favicon fallback.
 */
export const THESVG_SLUGS: Record<string, string> = {
  // ---------------- App Mode ----------------
  // Frontend
  nextjs: 'nextdotjs',
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
  astro: 'astro/light',
  solidjs: 'solidjs',
  angular: 'angular/mono',
  remix: 'remix/light',
  nuxt: 'nuxt/mono',

  // Styling / UI
  tailwind: 'tailwind-css/mono',
  shadcn: 'shadcn-ui/light',
  radix: 'radix-ui/light',
  chakra: 'chakra-ui/mono',
  mantine: 'mantine',
  mui: 'mui',
  bootstrap: 'bootstrap',

  // Backend
  nodejs: 'nodedotjs/mono',
  bun: 'bun',
  deno: 'deno/light',
  'python-fastapi': 'fastapi',
  go: 'go/mono',
  rails: 'ruby-on-rails',
  phoenix: 'phoenix-framework',
  nestjs: 'nestjs',
  hono: 'hono',
  dotnet: 'dotnet',
  spring: 'spring',

  // Hosting
  vercel: 'vercel/light',
  'cloudflare-workers': 'cloudflare-workers',
  'cloudflare-pages': 'cloudflare-pages',
  'aws-lambda': 'aws-aws-lambda',
  'aws-ec2': 'aws-amazon-ec2',
  'gcp-run': 'google-cloud',
  'azure-app': 'microsoft-azure',
  // fly: theSVG only ships a white-fill default, falls back to favicon.
  railway: 'railway/light',
  render: 'render',
  netlify: 'netlify',
  digitalocean: 'digitalocean',

  // Database
  postgres: 'postgresql',
  neon: 'neon',
  supabase: 'supabase',
  planetscale: 'planetscale/light',
  mysql: 'mysql/light',
  mongodb: 'mongodb',
  firebase: 'firebase',
  dynamodb: 'aws-amazon-dynamodb',
  convex: 'convex',
  turso: 'turso',
  d1: 'cloudflare/color',
  redis: 'redis',

  // ORM
  prisma: 'prisma/light',
  drizzle: 'drizzle',
  typeorm: 'typeorm',
  sequelize: 'sequelize',
  'raw-sql': 'postgresql',

  // Auth
  clerk: 'clerk/light',
  auth0: 'auth0',
  'supabase-auth': 'supabase',
  authjs: 'authdotjs',
  // workos: theSVG variants all use white-fill via CSS class, falls back to favicon.
  'firebase-auth': 'firebase',
  'better-auth': 'better-auth',
  cognito: 'aws-amazon-cognito',

  // Storage
  s3: 'aws-amazon-simple-storage-service',
  r2: 'cloudflare/color',
  'vercel-blob': 'vercel-blob',
  gcs: 'google-cloud-storage',
  'azure-blob': 'microsoft-azure',
  'supabase-storage': 'supabase',

  // Monitoring
  sentry: 'sentry',
  datadog: 'datadog',
  newrelic: 'new-relic',
  grafana: 'grafana',
  honeycomb: 'honeycomb/mono',
  axiom: 'axiom/light',
  'better-stack': 'better-stack',

  // Product Analytics
  posthog: 'posthog/mono',
  mixpanel: 'mixpanel',

  // Web Analytics
  ga: 'google-analytics',
  plausible: 'plausible-analytics',
  fathom: 'fathom',
  'simple-analytics': 'simple-analytics',
  'vercel-analytics': 'vercel/light',
  'cf-analytics': 'cloudflare/color',

  // Email
  resend: 'resend',
  postmark: 'postmark',
  ses: 'aws-amazon-simple-email-service',
  mailgun: 'mailgun',
  loops: 'loops',

  // Payments
  stripe: 'stripe/mono',
  lemonsqueezy: 'lemon-squeezy',
  paddle: 'paddle',
  polar: 'polar/light',
  paypal: 'paypal',

  // AI / LLM
  anthropic: 'anthropic/light',
  openai: 'openai/light',
  gemini: 'gemini',
  'vercel-ai': 'vercel/light',
  replicate: 'replicate/light',
  groq: 'groq',
  // together: theSVG only carries a wide wordmark, falls back to favicon.

  // Search
  algolia: 'algolia/mono',
  meilisearch: 'meilisearch',
  typesense: 'typesense',
  elastic: 'elastic',
  'postgres-fts': 'postgresql',

  // CMS
  sanity: 'sanity/light',
  contentful: 'contentful',
  payload: 'payload-cms',
  strapi: 'strapi',
  'notion-cms': 'notion/mono',
  mdx: 'mdx',

  // CI/CD
  'gh-actions': 'github-actions',
  'vercel-deploys': 'vercel/light',
  circleci: 'circleci',
  'gitlab-ci': 'gitlab',
  buildkite: 'buildkite',

  // ---------------- Content Mode ----------------
  // Ideation
  notion: 'notion/mono',
  obsidian: 'obsidian',
  airtable: 'airtable',
  chatgpt: 'openai/light',
  claude: 'claude/color',
  perplexity: 'perplexity/color',
  'x-trends': 'x',
  spyder: 'spyder',

  // Scripting
  'google-docs': 'google-docs',
  'notion-w': 'notion/mono',
  'claude-w': 'claude/color',
  'chatgpt-w': 'openai/light',
  grammarly: 'grammarly',

  // Voice
  elevenlabs: 'elevenlabs',
  'openai-voice': 'openai/light',

  // Editing
  capcut: 'capcut',
  premiere: 'premiere',
  davinci: 'davinci-resolve',
  remotion: 'remotion',

  // Short-form
  'instagram-reels': 'instagram/mono',
  tiktok: 'tiktok',
  'youtube-shorts': 'youtube-shorts',
  'linkedin-short': 'linkedin',
  'x-video': 'x',

  // Long-form
  youtube: 'youtube/mono',
  podcast: 'spotify',
  'linkedin-long': 'linkedin',
  twitch: 'twitch',

  // Thumbnails
  figma: 'figma/color',
  canva: 'canva',
  photoshop: 'photoshop',
  midjourney: 'midjourney',
  'nano-banana': 'gemini',
  ideogram: 'ideogram',

  // Scheduling
  buffer: 'buffer',
  hootsuite: 'hootsuite',

  // Community
  circle: 'circle',
  discord: 'discord',
  substack: 'substack',
  convertkit: 'kit', // ConvertKit rebranded to Kit.

  // Monetization
  adsense: 'google-adsense',
}

/**
 * Build the CDN URL for a theSVG path.
 *
 * Accepts either a bare slug (uses the `default` variant) or `slug/variant`
 * (uses the explicit variant, e.g. `vercel/light`).
 */
export function thesvgUrl(slugOrPath: string): string {
  const path = slugOrPath.includes('/') ? slugOrPath : `${slugOrPath}/default`
  return `https://thesvg.org/icons/${path}.svg`
}
