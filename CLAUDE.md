# Stack Picker

Interactive picker: users choose one tool per layer across an App Stack or a
Content Operation, then copy a ready-made architecture prompt, download a PNG,
or export a React Flow diagram — all gated behind a one-time email capture.

See [README.md](README.md) for install, deploy, and customization.

## Layout

- `config/site.ts` (gitignored) — **all branding**: brand name, URL, avatar,
  nav links, meta, domain. `config/site.example.ts` is the tracked template.
- `src/shared/` — mode/layer/item data, prompt builder, icon-slug map,
  tier grouping for the diagram. Shared client/server.
- `src/client/` — React SPA. Entry in `App.tsx`, components in `components/`,
  hooks in `hooks/`, small libs in `lib/`.
- `src/server/index.ts` — Hono Worker with `POST /api/subscribe`. Security
  model documented in [SECURITY.md](SECURITY.md).
- `migrations/0001_initial.sql` — `subscribers` table.
- `scripts/init-config.mjs` — postinstall seed for `config/site.ts`.

## Modes

- **App Stack** — 17 layers: Frontend · Styling · Backend · Hosting · Database
  · ORM · Auth · Storage · Monitoring · Product Analytics · Web Analytics ·
  Email · Payments · AI/LLM · Search · CMS · CI/CD
- **Content Stack** — 12 layers: Content Style (kind `'style'`, rendered as
  pills) · Ideation · Scripting · Voiceover · Video Editing · Short-form ·
  Long-form · Thumbnails · Scheduling · Analytics · Community · Monetization

The data model supports adding new modes via `MODES` in `src/shared/data.ts`.

## Email gate

Every bottom-bar action (`copy_prompt`, `copy_stack_image`, `download_png`,
`download_diagram`, `reset`) opens the email modal on first use. On submit,
`POST /api/subscribe` stores `{email, action, mode, stack}` in D1. The email
is cached in `localStorage:stack-picker:unlocked-email` so the gate won't
re-prompt for the rest of the session.

## Logo chain

For each item: Google favicon (via `/api/favicon` Worker proxy) → monochrome
Simple Icons → initials monogram. Implemented in
`src/client/components/ItemLogo.tsx` with three-stage `onError` fallbacks.

Favicon stage runs for any item with a `domain` field. The proxy is
same-origin so `html-to-image` can embed favicons into exported PNGs.
Simple Icons fallback uses `cdn.simpleicons.org/<slug>/0a0a0a` so the SVG
fill is baked black — consistent on the always-white logo tile in both
light and dark modes.

## Reference

Inspired by stackpicker.arjaythedev.com — same scroll-canvas pattern and
email-gated export flow, reshaped around two modes (App + Content), a clean
monochrome theme, a React Flow system-design export, and a config-driven
branding layer.
