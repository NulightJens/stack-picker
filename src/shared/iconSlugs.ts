/**
 * Maps our internal item ids to Simple Icons slugs.
 * https://simpleicons.org/ — 3000+ brand SVGs, served from cdn.simpleicons.org.
 *
 * Items not listed here fall back to the Google favicon (via domain) or
 * ultimately to an initials tile inside [ItemLogo].
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
  nuxt: 'nuxtdotjs',

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

  // Hosting
  vercel: 'vercel',
  'cloudflare-workers': 'cloudflareworkers',
  'aws-lambda': 'awslambda',
  'aws-ec2': 'amazonec2',
  'gcp-run': 'googlecloud',
  'azure-app': 'microsoftazure',
  fly: 'flydotio',
  railway: 'railway',
  render: 'render',
  netlify: 'netlify',
  digitalocean: 'digitalocean',

  // Database
  postgres: 'postgresql',
  neon: 'neon',
  supabase: 'supabase',
  planetscale: 'planetscale',
  mysql: 'mysql',
  mongodb: 'mongodb',
  firebase: 'firebase',
  dynamodb: 'amazondynamodb',
  convex: 'convex',
  turso: 'turso',
  d1: 'cloudflare',
  redis: 'redis',

  // ORM
  prisma: 'prisma',
  drizzle: 'drizzle',
  kysely: 'kysely',
  typeorm: 'typeorm',
  sequelize: 'sequelize',
  'raw-sql': 'postgresql',

  // Auth
  clerk: 'clerk',
  auth0: 'auth0',
  'supabase-auth': 'supabase',
  authjs: 'authjs',
  workos: 'workos',
  'firebase-auth': 'firebase',
  'better-auth': 'betterauth',
  cognito: 'amazoncognito',

  // Storage
  s3: 'amazons3',
  r2: 'cloudflare',
  'vercel-blob': 'vercel',
  gcs: 'googlecloudstorage',
  'azure-blob': 'microsoftazure',
  uploadthing: 'uploadthing',

  // Monitoring
  sentry: 'sentry',
  datadog: 'datadog',
  newrelic: 'newrelic',
  grafana: 'grafana',
  honeycomb: 'honeycomb',
  axiom: 'axiom',
  'better-stack': 'betterstack',

  // Product Analytics
  posthog: 'posthog',
  amplitude: 'amplitude',
  mixpanel: 'mixpanel',
  heap: 'heap',
  june: 'june',
  statsig: 'statsig',

  // Web Analytics
  ga: 'googleanalytics',
  plausible: 'plausibleanalytics',
  fathom: 'fathom',
  'simple-analytics': 'simpleanalytics',
  'vercel-analytics': 'vercel',
  'cf-analytics': 'cloudflare',

  // Email
  resend: 'resend',
  postmark: 'postmark',
  sendgrid: 'sendgrid',
  ses: 'amazonses',
  mailgun: 'mailgun',
  loops: 'loops',

  // Payments
  stripe: 'stripe',
  lemonsqueezy: 'lemonsqueezy',
  paddle: 'paddle',
  polar: 'polar',
  paypal: 'paypal',

  // AI
  anthropic: 'anthropic',
  openai: 'openai',
  gemini: 'googlegemini',
  'vercel-ai': 'vercel',
  replicate: 'replicate',
  together: 'together',
  groq: 'groq',

  // Search
  algolia: 'algolia',
  meilisearch: 'meilisearch',
  typesense: 'typesense',
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
  chatgpt: 'openai',
  claude: 'anthropic',
  perplexity: 'perplexity',
  'x-trends': 'x',

  // Scripting
  'google-docs': 'googledocs',
  'notion-w': 'notion',
  'claude-w': 'anthropic',
  'chatgpt-w': 'openai',
  hemingway: 'hemingway',
  grammarly: 'grammarly',

  // Voice
  elevenlabs: 'elevenlabs',
  'play-ht': 'playht',
  cartesia: 'cartesia',
  'openai-voice': 'openai',
  'descript-overdub': 'descript',

  // Editing
  capcut: 'capcut',
  premiere: 'adobepremierepro',
  'final-cut': 'finalcutpro',
  davinci: 'davinciresolve',
  descript: 'descript',
  'opus-clip': 'opus',
  remotion: 'remotion',

  // Short-form
  'instagram-reels': 'instagram',
  tiktok: 'tiktok',
  'youtube-shorts': 'youtubeshorts',
  'linkedin-short': 'linkedin',
  'x-video': 'x',

  // Long-form
  youtube: 'youtube',
  podcast: 'spotify',
  'linkedin-long': 'linkedin',
  twitch: 'twitch',

  // Thumbnails
  figma: 'figma',
  canva: 'canva',
  photoshop: 'adobephotoshop',
  midjourney: 'midjourney',
  'nano-banana': 'googlegemini',
  ideogram: 'ideogram',

  // Scheduling
  buffer: 'buffer',
  hootsuite: 'hootsuite',
  later: 'later',
  metricool: 'metricool',
  publer: 'publer',

  // Analytics
  tubebuddy: 'tubebuddy',
  vidiq: 'vidiq',
  'metricool-a': 'metricool',
  apify: 'apify',

  // Community
  skool: 'skool',
  circle: 'circle',
  discord: 'discord',
  beehiiv: 'beehiiv',
  substack: 'substack',
  convertkit: 'convertkit',

  // Monetization
  adsense: 'googleadsense',
}

/**
 * Simple Icons CDN URL.
 *
 * By default renders in the brand color. Pass a hex (no `#`) to force a color
 * — useful for monochrome contexts ("000000" in light mode, "ffffff" in dark).
 */
export function simpleIconUrl(slug: string, colorHex?: string): string {
  const base = `https://cdn.simpleicons.org/${slug}`
  return colorHex ? `${base}/${colorHex.replace(/^#/, '')}` : base
}
