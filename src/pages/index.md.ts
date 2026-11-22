import type { APIRoute } from 'astro'
import { cv } from '@/data/cv'
import { pageMarkdown } from '@/data/machine-readable'

export const prerender = true

/** Markdown copy of the homepage for AI agents (llmstxt.org convention). */
export const GET: APIRoute = ({ site }) => new Response(pageMarkdown(cv, new URL(site ?? cv.site.url).origin, 'home'), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
})
