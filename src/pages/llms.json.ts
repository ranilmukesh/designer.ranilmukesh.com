import type { APIRoute } from 'astro'
import { cv } from '@/data/cv'
import { llmsJson } from '@/data/machine-readable'

export const prerender = true

export const GET: APIRoute = ({ site }) => new Response(`${JSON.stringify(llmsJson(cv, new URL(site ?? cv.site.url).origin), null, 2)}\n`, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})
