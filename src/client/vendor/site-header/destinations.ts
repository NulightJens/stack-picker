export type CurrentSiteId = 'stack' | 'resources' | 'carousel'

export interface Destination {
  id: CurrentSiteId
  label: string
  href: string
  /** Used as the right-aligned subtext in the mobile sheet. */
  subdomain: string
}

export const DESTINATIONS: readonly Destination[] = [
  { id: 'stack', label: 'Stack', href: 'https://stack.jensheitmann.com', subdomain: 'stack.jensheitmann.com' },
  { id: 'resources', label: 'Resources', href: 'https://resources.jensheitmann.com', subdomain: 'resources.jensheitmann.com' },
  { id: 'carousel', label: 'Carousel', href: 'https://carousel.jensheitmann.com', subdomain: 'carousel.jensheitmann.com' },
] as const

export function isCurrentSiteId(value: unknown): value is CurrentSiteId {
  return value === 'stack' || value === 'resources' || value === 'carousel'
}

export const HOME_URL = 'https://jensheitmann.com'
export const WORDMARK = 'Jens Heitmann'
export const LOGO_SRC = '/jens-headshot.jpeg'
export const CTA_URL = 'https://workwithme.jensheitmann.com'
export const CTA_LABEL = 'Work with me'
