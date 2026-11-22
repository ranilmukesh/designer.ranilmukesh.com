import { describe, expect, it } from 'vitest'
import { citationKey, toBibtex } from './bibtex'

const journal = {
  name: 'Self-Defending 6G Networks Through AI-Driven Adaptive Decoy Generation at the Edge',
  publisher: 'Scientific Reports (Nature Portfolio)',
  releaseDate: '2026-05-26',
  doi: '10.1038/s41598-026-52368-z',
  issn: '2045-2322',
  authors: ['Ranil Mukesh M J', 'Pandiya Rajan G'],
}

describe('toBibtex', () => {
  it('writes a journal article with DOI and authors in order', () => {
    const entry = toBibtex(journal)
    expect(entry.startsWith('@article{j2026selfdefending,')).toBe(true)
    expect(entry).toContain('author = {Ranil Mukesh M J and Pandiya Rajan G}')
    expect(entry).toContain('journal = {Scientific Reports (Nature Portfolio)}')
    expect(entry).toContain('doi = {10.1038/s41598-026-52368-z}')
    expect(entry).toContain('url = {https://doi.org/10.1038/s41598-026-52368-z}')
  })

  it('uses inproceedings and booktitle for conferences', () => {
    const entry = toBibtex({
      name: 'One Model Fits All?',
      publisher: '6th International Conference on AI, IEEE',
      releaseDate: '2025-05-07',
      authors: ['Ranil Mukesh MJ'],
    })
    expect(entry.startsWith('@inproceedings{')).toBe(true)
    expect(entry).toContain('booktitle = {6th International Conference on AI, IEEE}')
  })

  it('escapes TeX specials and builds a stable key', () => {
    expect(toBibtex({ name: 'Ensembling & Retrieval' })).toContain('title = {Ensembling \\& Retrieval}')
    expect(citationKey({
      name: 'A tiny test',
      authors: ['Ada Lovelace'],
      releaseDate: '1843-01',
    })).toBe('lovelace1843tiny')
  })
})
