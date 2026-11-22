import type { APIRoute } from 'astro'
import { cv } from '@/data/cv'
import { llmsFullTxt } from '@/data/machine-readable'

export const prerender = true

export const GET: APIRoute = ({ site }) => new Response(llmsFullTxt(cv, new URL(site ?? cv.site.url).origin), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
})
