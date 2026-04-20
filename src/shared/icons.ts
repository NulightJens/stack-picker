/**
 * Logo URL builder. Matches the reference site's approach:
 * Clearbit as the primary source (clean transparent PNGs), with
 * Google's favicon service as a cheap fallback when Clearbit 404s.
 *
 * Consumers should render the primary URL first and swap to the
 * fallback `onError`, and fall back to an initials tile if both fail.
 */
export function logoUrl(domain: string, size = 128): string {
  return `https://logo.clearbit.com/${encodeURIComponent(domain)}?size=${size}`
}

export function logoFallbackUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}

/** Short 1–2 character tile text used when no logo is available. */
export function initialsFor(name: string): string {
  const cleaned = name.replace(/[()]/g, '').trim()
  const words = cleaned.split(/[\s/.-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
