# Security

## Threat model

This is a public-facing interactive tool that collects opt-in email addresses
tied to a user's stack selection. The realistic threats are:

1. **Abuse of the email form** — bots scripting fake submissions, spamming D1,
   or enumerating existing emails.
2. **Cross-site abuse** — another site embedding the picker in an iframe,
   scraping the logos CDN traffic via referrer, or CSRF-posting to the
   subscribe endpoint.
3. **Supply chain** — dependency vulnerabilities.

## Mitigations in place

### Input hardening (see [src/server/index.ts](src/server/index.ts))
- `Content-Type: application/json` is required on `POST /api/subscribe`.
- Request body capped at **8 KiB** (`Content-Length` + actual text length).
- Email is validated against a regex and capped at **254 chars** (RFC max).
- Stack object must have **≤ 32 keys** and each value **≤ 64 chars**.
- `User-Agent` is truncated to 256 chars before being written to D1.
- All queries use parameterized `prepare().bind()` — no string concatenation.

### Abuse control
- In-memory sliding-window rate limit: **5 requests / 60 s per IP**, keyed
  on `CF-Connecting-IP`. This is per Worker isolate, so determined attackers
  can partially evade it across isolates — pair with a Cloudflare Rate
  Limiting rule for production.

### Transport
- **CORS allow-list**: only the origin set by `SITE_URL` in `wrangler.toml`
  can call the API. All other origins get the browser's default cross-origin
  block.
- **Security headers** on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - `Content-Security-Policy` on HTML responses — scripts/styles are `'self'`
    only; images allow the three logo CDNs; `frame-ancestors 'none'`;
    no `unsafe-eval`.

### Secrets
- No secrets required by the app itself. `wrangler.toml` contains only
  non-sensitive identifiers (Worker name, D1 binding, database_id, SITE_URL).
- If you add an admin endpoint later, use `wrangler secret put`.
- `.env`, `.env.local`, `.dev.vars`, and `config/site.ts` are gitignored.

### Dependencies
- `npm audit` shows 0 vulnerabilities at the time of writing. Re-run before
  each deploy.

## What's NOT covered

- **Email verification** — we accept any syntactically valid email. Add a
  double-opt-in flow if you plan to mail those addresses.
- **Bot detection** — for a higher-value form, front it with
  [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/).
- **DDoS protection beyond Cloudflare's baseline** — enable Cloudflare Bot
  Fight Mode and WAF rules if the picker starts attracting abuse.
- **GDPR / CCPA compliance** — this codebase doesn't include a cookie banner,
  consent management, or data-export/delete tooling. Add those before going
  live in regulated jurisdictions.

## Reporting a vulnerability

Open a private report via GitHub Security Advisories, or email the
address in the deploying instance's `SITE.brand.href` / repo profile.
