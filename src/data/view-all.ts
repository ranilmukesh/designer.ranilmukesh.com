/**
 * How the homepage "All …" buttons behave. Two builds exist for comparison:
 * - `pages` (default): each button opens its own page on this site (/work/, /research/, …).
 * - `expand`: each button unfolds the full list in place on the homepage.
 * Choose with the PUBLIC_VIEW_ALL environment variable at build time.
 */
export type ViewAllMode = 'pages' | 'expand'

export const VIEW_ALL_MODE: ViewAllMode = import.meta.env.PUBLIC_VIEW_ALL === 'expand'
  ? 'expand'
  : 'pages'

/** Full-list pages on this site. Each one is built in both modes. */
export const PAGES = {
  work: '/work/',
  research: '/research/',
  writing: '/writing/',
  expertise: '/expertise/',
} as const
