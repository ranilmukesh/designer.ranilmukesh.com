import type { APIRoute, GetStaticPaths } from 'astro'
import type { MarkdownPage } from '@/data/machine-readable'
import { cv } from '@/data/cv'
import { PAGE_PATHS, pageMarkdown } from '@/data/machine-readable'

export const prerender = true

export const getStaticPaths = (() =>
  (Object.keys(PAGE_PATHS) as MarkdownPage[])
    .filter(page => page !== 'home')
    .map(page => ({
      params: { section: page },
    }))) satisfies GetStaticPaths

/** Markdown copy of each section page: /work/index.md, /research/index.md, … */
export const GET: APIRoute = ({ params, site }) => new Response(pageMarkdown(cv, new URL(site ?? cv.site.url).origin, params.section as MarkdownPage), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
})
