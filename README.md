# Stack Picker

An interactive tech-stack picker. Click through each layer, pick one tool per
category, then copy a ready-made architecture prompt for your AI coding
environment or export the selection as a PNG / diagram.

Modeled after [stackpicker.arjaythedev.com](https://stackpicker.arjaythedev.com) — rebuilt
with an App mode and a Content Operation mode, an email-gated export flow, and a
clean monochrome theme that's easy to re-brand in one file.

![cover — fill this in once you deploy](.github/cover.png)

---

## Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 + Lucide icons + Manrope
- **Diagram**: [@xyflow/react](https://reactflow.dev) for the system-design export
- **Backend**: Cloudflare Workers (Hono) + D1 for email capture
- **Logos**: [Clearbit](https://clearbit.com/logo) → Google favicons → [Simple Icons](https://simpleicons.org) → initials

Everything runs on Cloudflare's free tier for real-world traffic.

---

## Quick start (local)

```bash
git clone https://github.com/YOUR_USER/stack-picker.git
cd stack-picker
npm install                    # seeds config/site.ts from the example
npm run dev                    # http://localhost:5173
```

The `/api/*` endpoints won't be live until you run `wrangler dev` alongside
(`npx wrangler dev` in another terminal), but the UI is fully functional in
Vite-only mode — email capture fails soft and the flow continues.

---

## Customize your branding (2 min)

All branding lives in **`config/site.ts`** — a single file that `npm install`
created for you from `config/site.example.ts`. Edit it:

```ts
export const SITE: SiteConfig = {
  brand: {
    name: 'Your Name',
    href: 'https://yoursite.com',
    // avatarSrc: '/your-avatar.jpg',   // optional; drop file in /public
  },
  nav: [
    { label: 'Home', href: 'https://yoursite.com' },
    { label: 'Stack', href: '/', active: true },
    { label: 'X', href: 'https://x.com/yourhandle', external: true },
  ],
  meta: {
    title: 'Stack Picker',
    description: 'Build your 2026 tech stack.',
    domain: 'stack.yoursite.com',
    wordmark: 'Your Name',
  },
}
```

`config/site.ts` is `.gitignore`-d, so your personal values never land in a
commit. The tracked `config/site.example.ts` is the onboarding template for
future contributors.

---

## Deploy to Cloudflare

Prerequisites: Cloudflare account + `wrangler login`.

```bash
# 1. Create the D1 database
npx wrangler d1 create stack-picker-db
# Paste the printed database_id into wrangler.toml

# 2. Run the migration on remote
npm run db:migrate:remote

# 3. Deploy
npm run deploy
# Worker goes live at https://stack-picker.<your-account>.workers.dev
```

Then add a custom domain in the Cloudflare dashboard:
*Workers & Pages → stack-picker → Settings → Triggers → Custom Domains*.

Update `SITE_URL` in [wrangler.toml](wrangler.toml) to your custom domain and
redeploy — the Worker uses that value as the CORS allow-list origin.

---

## Customize the stack data

Items, categories, and the diagram layout live under
[`src/shared/`](src/shared/):

- [`data.ts`](src/shared/data.ts) — every layer and item, per mode
- [`iconSlugs.ts`](src/shared/iconSlugs.ts) — Simple Icons slug per item
- [`diagram.ts`](src/shared/diagram.ts) — how layers group into tiers for the
  system-design export
- [`prompt.ts`](src/shared/prompt.ts) — the copy-prompt template

Add a new item: drop an entry in `data.ts`, add a Simple Icons slug to
`iconSlugs.ts` (or let it fall back to favicon/initials), done.

---

## Scripts

```
npm run dev               # Vite dev server (frontend only)
npm run build             # Build the SPA into dist/client
npx wrangler dev          # Full stack local (Worker + D1 + frontend)
npm run deploy            # Build + wrangler deploy
npm run db:migrate        # Run 0001_initial.sql against local D1
npm run db:migrate:remote # Same, against remote D1
npm run typecheck         # tsc --noEmit
```

---

## Security

See [SECURITY.md](SECURITY.md) for the hardening model
(rate limiting, CORS, security headers, input caps).

## License

[MIT](LICENSE) — do whatever you want with it.
