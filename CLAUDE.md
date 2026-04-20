# Stack Picker

Interactive stack picker at stack.jensheitmann.com (planned). Users pick items across layered categories (Frontend → Hosting → DB → Auth ... or for Content: Style → Ideation → Editing → Platforms ...), every export action gates behind email capture.

## Stack

- Cloudflare Workers (Hono) + Workers Static Assets (React SPA)
- D1 database (subscribers)
- React 19 + Tailwind v4 + Lucide + Manrope
- html-to-image for PNG export, Mermaid markdown for diagram export

## Architecture

- `src/shared/` — mode/layer/item data + prompt builder (shared between client and server)
- `src/client/` — React SPA (`App.tsx`, `components/`, `hooks/`, `lib/`)
- `src/server/index.ts` — Hono Worker, `POST /api/subscribe` writes to D1
- `migrations/0001_initial.sql` — `subscribers` table

## Modes

- **App Stack** — 14 layers: Frontend · Styling · Backend · Hosting · Database · ORM · Auth · Storage · Monitoring · Product Analytics · Web Analytics · Email · Payments · AI/LLM
- **Content Stack** — 12 layers: Content Style (pills, kind='style') · Ideation · Scripting · Voiceover · Video Editing · Short-form · Long-form · Thumbnails · Scheduling · Analytics · Community · Monetization

Business mode is deferred — data model supports it via `MODES` array in `src/shared/data.ts`.

## Email Gate

Every bottom action (`copy_prompt`, `copy_stack_image`, `download_png`, `download_diagram`, `reset`) opens `EmailModal`. On submit, `POST /api/subscribe` stores `{email, action, mode, stack}` in D1. Email stored in `localStorage:stack-picker:unlocked-email` after first submit — gate is bypassed for rest of session.

## Development

```bash
npm run dev                  # Vite dev server (frontend only) at http://localhost:5173
npx wrangler dev             # Full stack local (Worker + D1 + frontend) — requires D1 setup below
npm run build                # Build frontend to dist/client
npm run deploy               # Build + wrangler deploy to Cloudflare
```

## First-time Cloudflare Setup

```bash
# 1. Create D1 database, paste database_id into wrangler.toml
npx wrangler d1 create stack-picker-db

# 2. Run migrations
npm run db:migrate           # local
npm run db:migrate:remote    # remote

# 3. (Optional) custom domain
# Add stack.jensheitmann.com as Worker custom domain in Cloudflare dashboard.
```

## Reference

Inspired by stackpicker.arjaythedev.com — replicated layer model + email-gated exports, improved with mode switcher, Content mode, Jens light+dark theme.
