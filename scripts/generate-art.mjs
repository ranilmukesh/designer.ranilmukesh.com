import { Buffer } from 'node:buffer'
// @env node
// Generates the favicon, touch icons and social card. Outputs are committed.
// Project covers are drawn inline at build time by src/utils/cover.ts so they follow the palette.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const anton = (await readFile(new URL('node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2', root))).toString('base64')

const PAPER = '#f2eadb'
const INK = '#121110'
const SIGNAL = '#f03a17'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const DISPLAY = 'Anton, Impact, \'Arial Narrow\', sans-serif'

const fontFace = `<style>@font-face{font-family:Anton;src:url(data:font/woff2;base64,${anton}) format('woff2');}</style>`

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="${SIGNAL}"/>`
  + `<path fill="${INK}" d="M9 13h13a9 9 0 0 1 2.6 17.6L30 51h-7l-4.8-19H15v19H9zm6 6v7h7a3.5 3.5 0 0 0 0-7z"/>`
  + `<path fill="${INK}" d="M33 51V13h6l5 17 5-17h6v38h-6V31l-3.3 11h-3.4L39 31v20z"/>`
  + `<rect x="0" y="56" width="64" height="8" fill="${INK}"/></svg>\n`

const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${fontFace}`
  + `<rect width="1200" height="630" fill="${PAPER}"/>`
  + `<circle cx="1040" cy="250" r="190" fill="${SIGNAL}"/>`
  + `<path d="M800 630 1200 150" stroke="${INK}" stroke-width="40"/>`
  + `<rect width="1200" height="64" fill="${INK}"/>`
  + `<text x="48" y="42" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${PAPER}">PORTFOLIO / DESIGN EDITION</text>`
  + `<text x="1152" y="42" text-anchor="end" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${PAPER}">DESIGN.RANILMUKESH.COM</text>`
  + `<text x="40" y="300" font-family="${DISPLAY}" font-size="210" fill="${INK}">RANIL</text>`
  + `<text x="40" y="490" font-family="${DISPLAY}" font-size="170" fill="${INK}">MUKESH <tspan fill="${SIGNAL}">MJ</tspan></text>`
  + `<rect x="40" y="535" width="760" height="56" fill="${INK}"/>`
  + `<text x="60" y="573" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${PAPER}">CO-FOUNDER &amp; CTO / PHOBOSQ &amp; K22.AI</text>`
  + `</svg>\n`

await writeFile(new URL('public/favicon.svg', root), favicon)
const out = path => fileURLToPath(new URL(path, root))
await sharp(Buffer.from(favicon), { density: 400 }).resize(180, 180).png().toFile(out('public/apple-touch-icon.png'))
await sharp(Buffer.from(favicon), { density: 1000 }).resize(512, 512).png().toFile(out('public/icon-512.png'))
await sharp(Buffer.from(social)).png().toFile(out('public/og.png'))
console.log('Generated favicon, touch icons and social card. Project covers render inline (src/utils/cover.ts).')
