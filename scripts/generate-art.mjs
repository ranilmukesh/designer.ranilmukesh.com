import { Buffer } from 'node:buffer'
// @env node
// Generates the typographic project covers, favicon, touch icons and social card.
// Run with `pnpm art` after changing projects in cv.json. Outputs are committed.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const cv = JSON.parse(await readFile(new URL('cv.json', root), 'utf8'))
const anton = (await readFile(new URL('node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2', root))).toString('base64')

const PAPER = '#f2eadb'
const INK = '#121110'
const SIGNAL = '#f03a17'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const DISPLAY = 'Anton, Impact, \'Arial Narrow\', sans-serif'

const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const fontFace = `<style>@font-face{font-family:Anton;src:url(data:font/woff2;base64,${anton}) format('woff2');}</style>`

function wrap(name, max = 13) {
  const lines = []
  for (const word of name.toUpperCase().split(/\s+/)) {
    const last = lines.at(-1)
    if (last && `${last} ${word}`.length <= max)
      lines[lines.length - 1] = `${last} ${word}`
    else
      lines.push(word)
  }
  return lines
}

function category(project) {
  const links = [project.url, project.github].filter(Boolean).join(' ')
  if (/phobosq\.com/.test(links) || /phobosq/i.test(project.name))
    return 'PHOBOSQ / PRODUCT'
  if (/PhobosQ-ai/.test(links))
    return 'PHOBOSQ / RESEARCH CODE'
  if (/github\.com/.test(links))
    return 'OPEN SOURCE'
  return 'CASE STUDY'
}

/** Four rotating constructivist compositions; each returns background geometry. */
const compositions = [
  (fg, accent) => `<circle cx="1250" cy="380" r="330" fill="${accent}"/><path d="M820 980 1560 120" stroke="${fg}" stroke-width="54"/><rect x="1180" y="700" width="300" height="34" fill="${fg}"/>`,
  (fg, accent) => `<path d="M1600 140V1000H700z" fill="${accent}"/><circle cx="1290" cy="330" r="120" fill="${fg}"/><path d="M960 180h460" stroke="${fg}" stroke-width="10"/>`,
  (fg, accent) => `<rect x="1040" y="140" width="190" height="860" fill="${accent}"/><rect x="1230" y="330" width="250" height="250" fill="${fg}" transform="rotate(18 1355 455)"/><circle cx="1135" cy="250" r="56" fill="${PAPER}" stroke="${fg}" stroke-width="10"/>`,
  (fg, accent) => `<circle cx="1260" cy="560" r="320" fill="none" stroke="${fg}" stroke-width="10"/><circle cx="1260" cy="560" r="220" fill="none" stroke="${fg}" stroke-width="4" stroke-dasharray="6 14"/><path d="M1260 240a320 320 0 0 1 320 320H1260z" fill="${accent}"/><path d="M900 920 1600 220" stroke="${accent}" stroke-width="18"/>`,
]

function cover(project, index, total, dark) {
  const bg = dark ? INK : PAPER
  const fg = dark ? PAPER : INK
  const lines = wrap(project.name)
  const longest = Math.max(...lines.map(line => line.length))
  const size = Math.min(250, Math.floor(1000 / (longest * 0.5)), Math.floor(600 / (lines.length * 0.95)))
  const baseline = 930 - (lines.length - 1) * size * 0.93
  const noteY = Math.round(baseline - size * 0.98)
  const numberBase = noteY - 46
  const numberSize = Math.min(380, Math.floor((numberBase - 120) / 0.74))
  const number = String(index + 1).padStart(2, '0')
  const note = (project.highlights?.[0] ?? '').toUpperCase()
  const clipped = note.length > 52
    ? `${note.slice(0, 51).trimEnd()}…`
    : note
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">${fontFace}`
    + `<rect width="1600" height="1000" fill="${bg}"/>${
      compositions[index % compositions.length](fg, SIGNAL)
    }${numberSize >= 140
      ? `<text x="60" y="${numberBase}" font-family="${DISPLAY}" font-size="${numberSize}" fill="none" stroke="${fg}" stroke-width="3">${number}</text>`
      : ''
    }<rect x="0" y="0" width="1600" height="96" fill="${fg}"/>`
    + `<text x="64" y="60" font-family="${MONO}" font-size="30" letter-spacing="4" fill="${bg}">CASE ${number} / ${String(total).padStart(2, '0')}</text>`
    + `<text x="1536" y="60" text-anchor="end" font-family="${MONO}" font-size="30" letter-spacing="4" fill="${bg}">${escape(category(project))}</text>${
      lines.map((line, i) => `<text x="58" y="${Math.round(baseline + i * size * 0.93)}" font-family="${DISPLAY}" font-size="${size}" fill="${i === lines.length - 1
        ? SIGNAL
        : fg}">${escape(line)}</text>`).join('')
    }${clipped
      ? `<text x="64" y="${noteY}" font-family="${MONO}" font-size="28" letter-spacing="2" fill="${fg}">${escape(clipped)}</text>`
      : ''
    }</svg>\n`
}

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

const work = new URL('public/work/', root)
await rm(work, { recursive: true, force: true })
await mkdir(work, { recursive: true })
for (const [index, project] of cv.projects.entries()) {
  const light = project.image?.url
  const dark = project.image?.dark
  if (light?.startsWith('/work/'))
    await writeFile(new URL(`public${light}`, root), cover(project, index, cv.projects.length, false))
  if (dark?.startsWith('/work/'))
    await writeFile(new URL(`public${dark}`, root), cover(project, index, cv.projects.length, true))
}

await writeFile(new URL('public/favicon.svg', root), favicon)
const out = path => fileURLToPath(new URL(path, root))
await sharp(Buffer.from(favicon), { density: 400 }).resize(180, 180).png().toFile(out('public/apple-touch-icon.png'))
await sharp(Buffer.from(favicon), { density: 1000 }).resize(512, 512).png().toFile(out('public/icon-512.png'))
await sharp(Buffer.from(social)).png().toFile(out('public/og.png'))
console.log(`Generated ${cv.projects.length} covers, favicon, touch icons and social card.`)
