import type { APIRoute } from 'astro'
import { cv } from '@/data/cv'

export const prerender = true

/**
 * AI search, answer and training crawlers are welcomed by name (the owner opted in to all of them),
 * so a blanket rule elsewhere can never shut them out by accident.
 */
const AI_CRAWLERS = [
  // Search and answer engines
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Bingbot',
  'Googlebot',
  'DuckAssistBot',
  // Model training
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'Amazonbot',
]

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
  const origin = site ?? cv.site.url
  const sitemap = new URL(`${base}sitemap-index.xml`, origin).href
  const lines = cv.site.seo.noIndex
    ? ['User-agent: *', 'Disallow: /']
    : [
        `# ${cv.basics.name}. Machine-readable summaries:`,
        `#   ${new URL(`${base}llms.txt`, origin).href}`,
        `#   ${new URL(`${base}llms-full.txt`, origin).href}`,
        `#   ${new URL(`${base}llms.json`, origin).href}`,
        '',
        'User-agent: *',
        'Allow: /',
        '',
        ...AI_CRAWLERS.map(bot => `User-agent: ${bot}`),
        'Allow: /',
        '',
        `Sitemap: ${sitemap}`,
      ]

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
