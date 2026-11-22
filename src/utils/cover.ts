// Typographic project covers drawn inline so they follow the active palette and dark mode.
// Colours come from CSS classes (see styles/components/project-cover.css), never hex values.

interface CoverProject {
  name: string
  url?: string
  github?: string
  highlights?: readonly string[]
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function wrap(name: string, max = 13): string[] {
  const lines: string[] = []
  for (const word of name.toUpperCase().split(/\s+/)) {
    const last = lines.at(-1)
    if (last && `${last} ${word}`.length <= max)
      lines[lines.length - 1] = `${last} ${word}`
    else
      lines.push(word)
  }
  return lines
}

function category(project: CoverProject): string {
  const links = [project.url, project.github].filter(Boolean).join(' ')
  if (/phobosq\.com/.test(links) || /phobosq/i.test(project.name))
    return 'PHOBOSQ / PRODUCT'
  if (/PhobosQ-ai/.test(links))
    return 'PHOBOSQ / RESEARCH CODE'
  if (/github\.com/.test(links))
    return 'OPEN SOURCE'
  return 'CASE STUDY'
}

/** Four rotating constructivist compositions. */
const compositions = [
  () => `<circle class="c-accent" cx="1250" cy="380" r="330"/><path class="c-fg-line" d="M820 980 1560 120" stroke-width="54"/><rect class="c-fg" x="1180" y="700" width="300" height="34"/>`,
  () => `<path class="c-accent" d="M1600 140V1000H700z"/><circle class="c-fg" cx="1290" cy="330" r="120"/><path class="c-fg-line" d="M960 180h460" stroke-width="10"/>`,
  () => `<rect class="c-accent" x="1040" y="140" width="190" height="860"/><rect class="c-fg" x="1230" y="330" width="250" height="250" transform="rotate(18 1355 455)"/><circle class="c-bg c-fg-line" cx="1135" cy="250" r="56" stroke-width="10"/>`,
  () => `<circle class="c-none c-fg-line" cx="1260" cy="560" r="320" stroke-width="10"/><circle class="c-none c-fg-line" cx="1260" cy="560" r="220" stroke-width="4" stroke-dasharray="6 14"/><path class="c-accent" d="M1260 240a320 320 0 0 1 320 320H1260z"/><path class="c-accent-line" d="M900 920 1600 220" stroke-width="18"/>`,
]

/** Inner markup for a 1600×1000 cover. */
export function coverMarkup(project: CoverProject, index: number, total: number): string {
  const lines = wrap(project.name)
  const longest = Math.max(...lines.map(line => line.length))
  const size = Math.min(250, Math.floor(1000 / (longest * 0.5)), Math.floor(600 / (lines.length * 0.95)))
  const baseline = 930 - (lines.length - 1) * size * 0.93
  const noteY = Math.round(baseline - size * 0.98)
  const numberBase = noteY - 46
  const numberSize = Math.min(380, Math.floor((numberBase - 120) / 0.74))
  const number = String(index + 1).padStart(2, '0')
  const note = (project.highlights?.[0] ?? '').toUpperCase()
  const clipped = note.length > 34
    ? `${note.slice(0, 33).trimEnd()}…`
    : note
  return `<rect class="c-bg" width="1600" height="1000"/>${compositions[index % compositions.length]!()}${
    numberSize >= 140
      ? `<text class="c-none c-fg-line c-display" x="60" y="${numberBase}" font-size="${numberSize}" stroke-width="3">${number}</text>`
      : ''
  }<rect class="c-fg" x="0" y="0" width="1600" height="96"/>`
  + `<text class="c-bg c-mono" x="64" y="60" font-size="30" letter-spacing="4">CASE ${number} / ${String(total).padStart(2, '0')}</text>`
  + `<text class="c-bg c-mono" x="1536" y="60" text-anchor="end" font-size="30" letter-spacing="4">${escape(category(project))}</text>${
    lines.map((line, i) => `<text class="${i === lines.length - 1
      ? 'c-accent'
      : 'c-fg'} c-display" x="58" y="${Math.round(baseline + i * size * 0.93)}" font-size="${size}">${escape(line)}</text>`).join('')
  }${clipped
    ? `<text class="c-fg c-mono" x="64" y="${noteY}" font-size="28" letter-spacing="2">${escape(clipped)}</text>`
    : ''}`
}
