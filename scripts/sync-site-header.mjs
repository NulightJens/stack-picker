#!/usr/bin/env node
// Vendor ~/Projects/jensheitmann.com/packages/site-header/ into this project.
// Source of truth: ~/Projects/jensheitmann.com/. Run after editing Header.tsx
// upstream, or after pulling new versions of jensheitmann.com.

import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(homedir(), 'Projects/jensheitmann.com/packages/site-header')
const PROJECT_ROOT = join(__dirname, '..')
const VENDOR_DIR = join(PROJECT_ROOT, 'src/client/vendor/site-header')
const PUBLIC_DIR = join(PROJECT_ROOT, 'public')
const HEADSHOT_DEST = join(PUBLIC_DIR, 'jens-headshot.jpeg')

// Component sources are auto-discovered from SRC_DIR. To exclude a file,
// add it to EXCLUDED_FILES below or give it a .test.ts/.test.tsx extension.
const COMPONENT_EXTENSIONS = new Set(['.ts', '.tsx', '.css'])
const EXCLUDED_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'vitest.config.ts',
  'pnpm-lock.yaml',
  '.gitignore',
  'README.md',
])

function isComponentFile(name) {
  if (EXCLUDED_FILES.has(name)) return false
  if (name.endsWith('.test.ts') || name.endsWith('.test.tsx')) return false
  const dot = name.lastIndexOf('.')
  if (dot === -1) return false
  return COMPONENT_EXTENSIONS.has(name.slice(dot))
}

if (!existsSync(SRC_DIR)) {
  console.error(`Source not found: ${SRC_DIR}`)
  console.error('Clone or update ~/Projects/jensheitmann.com/ first.')
  process.exit(1)
}

// Discover component files (top-level only, no recursion).
const srcEntries = await readdir(SRC_DIR, { withFileTypes: true })
const componentFiles = srcEntries
  .filter(e => e.isFile() && isComponentFile(e.name))
  .map(e => e.name)
  .sort()

if (componentFiles.length === 0) {
  console.error(`No component files (*.ts, *.tsx, *.css) found in ${SRC_DIR}`)
  process.exit(1)
}

// Wipe vendor dir so removed files do not linger.
if (existsSync(VENDOR_DIR)) {
  await rm(VENDOR_DIR, { recursive: true, force: true })
}
await mkdir(VENDOR_DIR, { recursive: true })

for (const name of componentFiles) {
  const src = join(SRC_DIR, name)
  const dest = join(VENDOR_DIR, name)
  await copyFile(src, dest)
  console.log(`  ${name}`)
}

await mkdir(PUBLIC_DIR, { recursive: true })
await copyFile(join(SRC_DIR, 'jens-headshot.jpeg'), HEADSHOT_DEST)
console.log(`  jens-headshot.jpeg -> public/`)

console.log(`\nSynced site-header (${componentFiles.length} files) from ${SRC_DIR} -> ${VENDOR_DIR}`)
