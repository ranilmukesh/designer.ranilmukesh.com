import type { APIRoute } from 'astro'
import { cv } from '@/data/cv'
import { resumeJson } from '@/data/machine-readable'

export const prerender = true

export const GET: APIRoute = ({ site }) => new Response(`${JSON.stringify(resumeJson(cv, new URL(site ?? cv.site.url).origin), null, 2)}\n`, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})
