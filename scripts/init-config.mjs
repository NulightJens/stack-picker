#!/usr/bin/env node
/**
 * Postinstall: seed personal config files from their .example templates if
 * missing. Keeps forks buildable on first clone while protecting personal
 * values (both seeded files are gitignored).
 */
import { existsSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const seeds = [
  {
    target: resolve(root, 'config/site.ts'),
    example: resolve(root, 'config/site.example.ts'),
    hint: 'edit it with your branding.',
  },
  {
    target: resolve(root, 'wrangler.toml'),
    example: resolve(root, 'wrangler.example.toml'),
    hint: 'paste your D1 id + SITE_URL before deploying.',
  },
]

for (const { target, example, hint } of seeds) {
  if (!existsSync(target)) {
    copyFileSync(example, target)
    const relTarget = target.replace(root + '/', '')
    const relExample = example.replace(root + '/', '')
    console.log(`[stack-picker] Seeded ${relTarget} from ${relExample} — ${hint}`)
  }
}
