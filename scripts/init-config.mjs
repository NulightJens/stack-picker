#!/usr/bin/env node
/**
 * Postinstall: seed config/site.ts from config/site.example.ts if missing.
 * Keeps forks buildable on first clone while protecting personal values
 * (config/site.ts is gitignored).
 */
import { existsSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, 'config/site.ts')
const example = resolve(root, 'config/site.example.ts')

if (!existsSync(target)) {
  copyFileSync(example, target)
  console.log('[stack-picker] Seeded config/site.ts from site.example.ts — edit it with your branding.')
}
