/**
 * Maps our internal item ids to Iconify icon specs.
 *
 * Values are one of:
 *   - `"bare-slug"`           → `simple-icons:<slug>` via Iconify
 *   - `"pack:name"`            → any Iconify pack (logos, devicon, arcticons…)
 *
 * We route everything through `api.iconify.design` because:
 *   1. It has the same simple-icons slugs the upstream CDN serves — but its
 *      bundled snapshot still includes trademarked brands (AWS, Microsoft,
 *      Adobe, OpenAI, LinkedIn, Canva…) that simple-icons pruned from their
 *      direct CDN.
 *   2. It exposes other icon packs (Gil Barbara's `logos`, Devicon, Arcticons)
 *      for tools that simple-icons never covered.
 *   3. It supports `?color=<hex>` for forcing a monochrome fill on the
 *      simple-icons pack, which keeps the editorial monochrome aesthetic
 *      coherent with the current light/dark theme.
 *
 * Items NOT listed here render as an initials monogram inside ItemLogo.
 */
export const ICON_SLUGS: Record<string, string> = {
  // ---------------- App Mode ----------------
  // Frontend
  nextjs: 'nextdotjs',
  react: 'react',
  vue: 'vuedotjs',
  svelte: 'svelte',
  astro: 'astro',
  solidjs: 'solid',
  angular: 'angular',
  remix: 'remix',
  nuxt: 'nuxt',

  // Styling / UI
  tailwind: 'tailwindcss',
  shadcn: 'shadcnui',
  radix: 'radixui',
  chakra: 'chakraui',
  mantine: 'mantine',
  mui: 'mui',
  bootstrap: 'bootstrap',

  // Backend Runtime
  nodejs: 'nodedotjs',
  bun: 'bun',
  deno: 'deno',
  'python-fastapi': 'fastapi',
  go: 'go',
  rails: 'rubyonrails',
  phoenix: 'phoenixframework',
  nestjs: 'nestjs',
  hono: 'hono',
  dotnet: 'dotnet',
  spring: 'springboot',

  // Hosting — AWS + Azure trademarks removed from simple-icons direct CDN
  // but preserved in Iconify's bundled snapshot; still resolve as simple-icons
  // slugs via Iconify.
  vercel: 'vercel',
  'cloudflare-workers': 'cloudflareworkers',
  'aws-lambda': 'logos:aws-lambda',
  'aws-ec2': 'logos:aws-ec2',
  'gcp-run': 'googlecloud',
  'azure-app': 'logos:microsoft-azure',
  fly: 'flydotio',
  railway: 'railway',
  render: 'render',
  netlify: 'netlify',
  digitalocean: 'digitalocean',

  // Database
  postgres: 'postgresql',
  neon: 'logos:neon',
  supabase: 'supabase',
  planetscale: 'planetscale',
  mysql: 'mysql',
  mongodb: 'mongodb',
  firebase: 'firebase',
  dynamodb: 'logos:aws-dynamodb',
  convex: 'convex',
  turso: 'turso',
  d1: 'cloudflare',
  redis: 'redis',

  // ORM
  prisma: 'prisma',
  drizzle: 'drizzle',
  // kysely — not on Iconify, falls through to initials
  typeorm: 'typeorm',
  sequelize: 'sequelize',
  'raw-sql': 'postgresql',

  // Auth
  clerk: 'clerk',
  auth0: 'auth0',
  'supabase-auth': 'supabase',
  // authjs — not on Iconify, falls through to initials
  // workos — available on Iconify's logos pack
  workos: 'logos:workos',
  'firebase-auth': 'firebase',
  'better-auth': 'betterauth',
  cognito: 'logos:aws-cognito',

  // Storage
  s3: 'logos:aws-s3',
  r2: 'cloudflare',
  'vercel-blob': 'vercel',
  gcs: 'googlecloudstorage',
  'azure-blob': 'logos:microsoft-azure',
  // uploadthing — not on Iconify, falls through to initials

  // Monitoring
  sentry: 'sentry',
  datadog: 'datadog',
  newrelic: 'newrelic',
  grafana: 'grafana',
  // honeycomb, axiom — not on Iconify, initials

  // Product Analytics
  posthog: 'posthog',
  amplitude: 'logos:amplitude-icon',
  mixpanel: 'mixpanel',
  heap: 'logos:heap',
  // june, statsig — not on Iconify, initials

  // Web Analytics
  ga: 'googleanalytics',
  plausible: 'plausibleanalytics',
  fathom: 'fathom',
  'simple-analytics': 'simpleanalytics',
  'vercel-analytics': 'vercel',
  'cf-analytics': 'cloudflare',

  // Email
  resend: 'resend',
  // postmark — not on Iconify, initials
  // sendgrid — in Iconify's simple-icons bundle
  sendgrid: 'logos:sendgrid',
  ses: 'logos:aws-ses',
  mailgun: 'mailgun',
  loops: 'loops',

  // Payments
  stripe: 'stripe',
  lemonsqueezy: 'lemonsqueezy',
  paddle: 'paddle',
  // polar — not on Iconify, initials
  paypal: 'paypal',

  // AI
  anthropic: 'anthropic',
  openai: 'logos:openai',
  gemini: 'googlegemini',
  'vercel-ai': 'vercel',
  replicate: 'replicate',
  // together, groq — not on Iconify, initials

  // Search
  algolia: 'algolia',
  meilisearch: 'meilisearch',
  typesense: 'logos:typesense',
  elastic: 'elastic',
  'postgres-fts': 'postgresql',

  // CMS
  sanity: 'sanity',
  contentful: 'contentful',
  payload: 'payloadcms',
  strapi: 'strapi',
  'notion-cms': 'notion',
  mdx: 'mdx',

  // CI/CD
  'gh-actions': 'githubactions',
  'vercel-deploys': 'vercel',
  circleci: 'circleci',
  'gitlab-ci': 'gitlab',
  buildkite: 'buildkite',

  // ---------------- Content Mode ----------------
  // Ideation
  notion: 'notion',
  obsidian: 'obsidian',
  airtable: 'airtable',
  chatgpt: 'logos:openai',
  claude: 'anthropic',
  perplexity: 'perplexity',
  'x-trends': 'x',

  // Scripting
  'google-docs': 'googledocs',
  'notion-w': 'notion',
  'claude-w': 'anthropic',
  'chatgpt-w': 'logos:openai',
  // hemingway — not on Iconify, initials
  grammarly: 'grammarly',

  // Voice
  elevenlabs: 'elevenlabs',
  // play-ht, cartesia — not on Iconify, initials
  'openai-voice': 'logos:openai',
  'descript-overdub': 'logos:descript',

  // Editing — Adobe trademarks pruned from simple-icons direct CDN but
  // preserved in Iconify's bundled snapshot.
  capcut: 'arcticons:capcut',
  premiere: 'logos:adobe-premiere',
  // final-cut — not on Iconify, initials
  davinci: 'davinciresolve',
  descript: 'logos:descript',
  // opus-clip, remotion — not on Iconify, initials

  // Short-form
  'instagram-reels': 'instagram',
  tiktok: 'tiktok',
  'youtube-shorts': 'youtubeshorts',
  'linkedin-short': 'logos:linkedin-icon',
  'x-video': 'x',

  // Long-form
  youtube: 'youtube',
  podcast: 'spotify',
  'linkedin-long': 'logos:linkedin-icon',
  twitch: 'twitch',

  // Thumbnails
  figma: 'figma',
  canva: 'simple-icons:canva', // pruned from direct CDN; Iconify bundle keeps it (monochrome).
  photoshop: 'logos:adobe-photoshop',
  midjourney: 'logos:midjourney',
  'nano-banana': 'googlegemini',
  // ideogram — not on Iconify, initials

  // Scheduling
  buffer: 'buffer',
  hootsuite: 'hootsuite',
  // later, metricool, publer — not on Iconify, initials

  // Analytics
  // tubebuddy — not on Iconify, initials
  vidiq: 'arcticons:vidiq',
  // metricool-a — not on Iconify, initials
  apify: 'devicon:apify',

  // Community
  skool: 'arcticons:skool',
  circle: 'circle',
  discord: 'discord',
  // beehiiv — not on Iconify, initials
  substack: 'substack',
  convertkit: 'kit', // ConvertKit rebranded to Kit.

  // Monetization
  adsense: 'googleadsense',
}

/**
 * Build the CDN URL for an icon spec.
 *
 * Dual source by design:
 *   - Bare slug → Simple Icons direct CDN, which bakes the brand's primary
 *     color into the SVG `fill`. Every working simple-icons brand ships
 *     brand-colored.
 *   - `"pack:name"` → Iconify, for packs the direct CDN doesn't cover
 *     (trademark-pruned brands in the `logos` pack, pictograms in
 *     `arcticons`, etc.) and which typically ship multi-color branded
 *     SVGs too.
 *
 * The brand-color goal is why we don't round-trip everything through
 * Iconify's simple-icons pack: it rewrites SVG fills to `currentColor`,
 * stripping the brand color. Direct CDN preserves it.
 */
export function iconUrl(spec: string): string {
  if (spec.includes(':')) {
    const [pack, name] = spec.split(':', 2)
    return `https://api.iconify.design/${pack}/${name}.svg`
  }
  return `https://cdn.simpleicons.org/${spec}`
}
