// BibTeX entries for papers with a venue, so readers and reference managers can cite them.

interface CitablePaper {
  name: string
  publisher?: string
  releaseDate?: string
  doi?: string
  issn?: string
  authors?: readonly string[]
  url?: string
}

const escapeTex = (value: string) => value.replace(/[{}]/g, '').replace(/([&%$#_])/g, '\\$1')

/** Citation key: first author's last word + year + first title word, e.g. `mj2026selfdefending`. */
export function citationKey(paper: CitablePaper): string {
  const author = (paper.authors?.[0] ?? 'paper').split(/\s+/).filter(Boolean).at(-1) ?? 'paper'
  const year = paper.releaseDate?.slice(0, 4) ?? ''
  const word = paper.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).find(w => w.length > 3) ?? ''
  return `${author}${year}${word}`.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** A conference paper when the venue names a conference, otherwise a journal article. */
export function toBibtex(paper: CitablePaper): string {
  const conference = /conference|proceedings|symposium|workshop/i.test(paper.publisher ?? '')
  const fields: [string, string | undefined][] = [
    ['title', paper.name],
    [
      'author',
      paper.authors?.join(' and '),
    ],
    [
      conference ? 'booktitle' : 'journal',
      paper.publisher,
    ],
    [
      'year',
      paper.releaseDate?.slice(0, 4),
    ],
    ['issn', paper.issn],
    ['doi', paper.doi],
    [
      'url',
      paper.doi
        ? `https://doi.org/${paper.doi}`
        : paper.url,
    ],
  ]
  const body = fields
    .filter((field): field is [string, string] => Boolean(field[1]))
    .map(([key, value]) => `  ${key} = {${escapeTex(value)}}`)
    .join(',\n')
  return `@${conference ? 'inproceedings' : 'article'}{${citationKey(paper)},\n${body}\n}`
}
