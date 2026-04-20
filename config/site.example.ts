/**
 * Single source of truth for branding.
 *
 * Forkers: this file is tracked. On `npm install`, scripts/init-config.mjs
 * copies it to `config/site.ts` (which is gitignored) if that file is
 * missing. Edit `config/site.ts` with your own values — you won't be able
 * to accidentally commit them.
 */

export interface NavLink {
  label: string
  href: string
  /** Mark as the current page (bolded in the header). */
  active?: boolean
  /** Open in a new tab. */
  external?: boolean
}

export interface SiteConfig {
  brand: {
    /** Name shown in the header and on export footers. */
    name: string
    /** Where the brand link goes (e.g. your personal site). */
    href: string
    /**
     * Optional avatar path served from /public. Omit for a monogram tile
     * built from `brand.name` — the monogram uses the same style as the
     * item-logo fallback so it still looks intentional.
     */
    avatarSrc?: string
  }
  /** Site-level navigation links shown after the brand. */
  nav: NavLink[]
  /** External social links — none by default. */
  social: NavLink[]
  meta: {
    /** Sets document.title on mount. */
    title: string
    description: string
    /** Shown in the PNG/diagram export footer. */
    domain: string
    /** Wordmark in the PNG/diagram export footer (defaults to brand.name). */
    wordmark?: string
  }
}

export const SITE: SiteConfig = {
  brand: {
    name: 'Your Name',
    href: 'https://example.com',
    // avatarSrc: '/avatar.jpg',
  },
  nav: [
    { label: 'Stack', href: '/', active: true },
  ],
  social: [],
  meta: {
    title: 'Stack Picker',
    description: 'Build your 2026 tech stack — pick one tool per layer, copy a ready-made prompt, download a diagram.',
    domain: 'stack.example.com',
  },
}
