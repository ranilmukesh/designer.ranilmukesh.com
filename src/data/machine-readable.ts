// Plain-text views of the site for AI agents and crawlers: llms.txt, llms-full.txt, llms.json and a
// Markdown copy of every page (llmstxt.org convention: /page/ → /page/index.md). Everything is built
// from cv.json, so these files cannot drift from the HTML.
import type { CV } from './schema'

export type MarkdownPage = 'home' | 'work' | 'research' | 'writing' | 'expertise' | 'credentials'

interface Ctx {
  cv: CV
  /** Absolute origin, e.g. https://design.ranilmukesh.com */
  origin: string
}

export const PAGE_PATHS: Record<MarkdownPage, string> = {
  home: '/',
  work: '/work/',
  research: '/research/',
  writing: '/writing/',
  expertise: '/expertise/',
  credentials: '/credentials/',
}

const PAGE_TITLES: Record<MarkdownPage, string> = {
  home: 'Profile',
  work: 'Work: every project',
  research: 'Research: every paper',
  writing: 'Writing: every article',
  expertise: 'Expertise: full skills board',
  credentials: 'Credentials and proof',
}

const PAGE_NOTES: Record<MarkdownPage, string> = {
  home: 'Who he is, what he builds, and how to verify it.',
  work: 'All projects with descriptions, highlights and links.',
  research: 'All papers: peer-reviewed work with DOIs first, then pre-prints with PDFs.',
  writing: 'All long-form articles, hosted on ranilmukesh.com.',
  expertise: 'Skills grouped by discipline.',
  credentials: 'Awards, certifications, research identifiers and the public page behind each claim.',
}

function markdownUrl(origin: string, page: MarkdownPage) {
  return `${origin}${PAGE_PATHS[page]}index.md`
}

const status = { published: 'Published', accepted: 'Accepted', preprint: 'Pre-print' } as const

function month(date?: string) {
  if (!date)
    return ''
  const [year, m] = date.split('-')
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return m
    ? `${names[Number(m) - 1]} ${year}`
    : year!
}

function link(label: string, url?: string) {
  return url
    ? `[${label}](${url})`
    : label
}

function header({ cv }: Ctx, page: MarkdownPage): string {
  const { basics } = cv
  const title = page === 'home'
    ? basics.name
    : `${basics.name}: ${PAGE_TITLES[page]}`
  return `# ${title}\n\n> ${basics.name} is ${basics.label}. ${cv.hero.description ?? ''}`.trimEnd()
}

function asOf({ cv }: Ctx): string {
  return cv.recognition
    ? `Figures checked ${cv.recognition.asOf}.`
    : ''
}

function proofList(ctx: Ctx): string {
  const items = ctx.cv.recognition?.items ?? []
  return items.map(item => `- **${item.value}**: ${item.label}${item.detail
    ? `. ${item.detail}`
    : ''}. Verify: ${item.url}`).join('\n')
}

function identityList({ cv }: Ctx): string {
  return [
    ...cv.identifiers.map(id => `- ${id.name}: ${link(id.value, id.url)}`),
    ...cv.basics.profiles
      .filter(profile => !cv.identifiers.some(id => id.url === profile.url))
      .map(profile => `- ${profile.network}: ${link(profile.username, profile.url)}`),
    cv.basics.url
      ? `- Main site: ${cv.basics.url}`
      : '',
  ].filter(Boolean).join('\n')
}

function workSection({ cv }: Ctx, all: boolean): string {
  const projects = all
    ? cv.projects
    : cv.projects.filter(project => project.featured)
  return projects.map((project, index) => {
    const links = [
      project.url && link('Site', project.url),
      project.github && link('Code', project.github),
      ...(project.links ?? []).map(extra => link(extra.label, extra.url)),
    ].filter(Boolean).join(' · ')
    const highlights = (project.highlights ?? []).map(item => `  - ${item}`).join('\n')
    return `### ${String(index + 1).padStart(2, '0')}. ${project.name}\n\n${project.description}${highlights
      ? `\n\n${highlights}`
      : ''}${links
      ? `\n\nLinks: ${links}`
      : ''}`
  }).join('\n\n')
}

function paperSection({ cv }: Ctx, all: boolean): string {
  const papers = all
    ? cv.publications
    : cv.publications.filter(paper => paper.featured)
  return papers.map((paper) => {
    const meta = [
      status[paper.status],
      paper.publisher,
      month(paper.releaseDate),
      paper.firstAuthor ? 'First author' : '',
      paper.award,
    ].filter(Boolean).join(' · ')
    const links = [
      paper.doi && link(`DOI ${paper.doi}`, `https://doi.org/${paper.doi}`),
      paper.url && !(paper.doi && paper.url.includes(paper.doi)) && link(/\.pdf/i.test(paper.url)
        ? 'PDF'
        : 'Source', paper.url),
      paper.awardUrl && paper.awardUrl !== paper.url && link('Award post', paper.awardUrl),
      paper.github && link('Code', paper.github),
    ].filter(Boolean).join(' · ')
    return [
      `### ${paper.name}`,
      meta,
      paper.authors?.length
        ? `Authors: ${paper.authors.join(', ')}`
        : '',
      paper.summary ?? '',
      links
        ? `Links: ${links}`
        : '',
    ].filter(Boolean).join('\n\n')
  }).join('\n\n')
}

function writingSection({ cv }: Ctx): string {
  return cv.articles.map(article => `- ${link(article.title, article.url)} (${month(article.date)})${article.description
    ? `: ${article.description}`
    : ''}`).join('\n')
}

function skillsSection({ cv }: Ctx): string {
  const groups = new Map<string, string[]>()
  for (const skill of cv.skills) {
    const key = skill.category?.trim() || 'Other'
    groups.set(key, [
      ...(groups.get(key) ?? []),
      skill.name,
    ])
  }
  return [...groups].map(([group, names]) => `- **${group}**: ${names.join(', ')}`).join('\n')
}

function experienceSection({ cv }: Ctx): string {
  return cv.work.map((job) => {
    const items = [
      ...(job.responsibilities ?? []),
      ...(job.highlights ?? []),
      ...(job.achievements ?? []),
    ].map(item => `  - ${item}`).join('\n')
    const summary = Array.isArray(job.summary)
      ? job.summary.join(' ')
      : job.summary
    return `### ${job.position}, ${link(job.name, job.url)}\n\n${summary ?? ''}${items
      ? `\n\n${items}`
      : ''}`
  }).join('\n\n')
}

function credentialsSection({ cv }: Ctx): string {
  const awards = cv.awards.map(award => `- **${award.title}**, ${award.awarder}${award.date
    ? ` (${month(award.date)})`
    : ''}. ${award.summary ?? ''} ${award.url
    ? `Evidence: ${award.url}`
    : ''}`.trimEnd()).join('\n')
  const certs = cv.certificates.map(certificate => `- ${link(certificate.name, certificate.url)}, ${certificate.issuer}${certificate.date
    ? ` (${month(certificate.date)})`
    : ''}`).join('\n')
  const education = cv.education.map(school => `- ${school.studyType}, ${school.area}, ${school.institution}`).join('\n')
  return [
    awards && `## Awards\n\n${awards}`,
    certs && `## Certifications\n\n${certs}`,
    education && `## Education\n\n${education}`,
  ].filter(Boolean).join('\n\n')
}

function footer(ctx: Ctx, page: MarkdownPage): string {
  const html = `${ctx.origin}${PAGE_PATHS[page]}`
  const email = ctx.cv.basics.email
  return `---\n\nHTML version: ${html}${email
    ? `\nContact: ${email}`
    : ''}\n${asOf(ctx)}`.trimEnd()
}

/** Markdown copy of one page. */
export function pageMarkdown(cv: CV, origin: string, page: MarkdownPage): string {
  const ctx = { cv, origin }
  const body: Record<MarkdownPage, () => string> = {
    home: () => [
      cv.basics.summary ?? '',
      `## Proof\n\n${proofList(ctx)}`,
      `## Identity and profiles\n\n${identityList(ctx)}`,
      `## Experience\n\n${experienceSection(ctx)}`,
      `## Featured work\n\n${workSection(ctx, false)}\n\nAll ${cv.projects.length} projects: ${markdownUrl(origin, 'work')}`,
      `## Peer-reviewed research\n\n${paperSection(ctx, false)}\n\nAll ${cv.publications.length} papers: ${markdownUrl(origin, 'research')}`,
      `## Writing\n\n${writingSection(ctx)}`,
      `## Expertise\n\n${skillsSection(ctx)}`,
    ].join('\n\n'),
    work: () => workSection(ctx, true),
    research: () => paperSection(ctx, true),
    writing: () => writingSection(ctx),
    expertise: () => skillsSection(ctx),
    credentials: () => [
      `## At a glance\n\n${proofList(ctx)}`,
      `## Research identifiers and profiles\n\n${identityList(ctx)}`,
      credentialsSection(ctx),
    ].join('\n\n'),
  }
  return `${header(ctx, page)}\n\n${body[page]()}\n\n${footer(ctx, page)}\n`
}

/** /llms.txt: curated index in the llmstxt.org format. */
export function llmsTxt(cv: CV, origin: string): string {
  const ctx = { cv, origin }
  const pages = (Object.keys(PAGE_PATHS) as MarkdownPage[])
    .map(page => `- [${PAGE_TITLES[page]}](${markdownUrl(origin, page)}): ${PAGE_NOTES[page]}`)
    .join('\n')
  const papers = cv.publications
    .filter(paper => paper.status !== 'preprint')
    .map(paper => `- [${paper.name}](${paper.doi
      ? `https://doi.org/${paper.doi}`
      : paper.url}): ${[
      status[paper.status],
      paper.publisher,
      month(paper.releaseDate),
      paper.firstAuthor ? 'first author' : '',
      paper.award,
    ].filter(Boolean).join(', ')}`)
    .join('\n')
  const featured = cv.projects
    .filter(project => project.featured)
    .map(project => `- [${project.name}](${project.url ?? project.github ?? `${origin}/work/`}): ${project.description}`)
    .join('\n')
  const preprints = cv.publications
    .filter(paper => paper.status === 'preprint')
    .map(paper => `- [${paper.name}](${paper.url})`)
    .join('\n')
  return `${header(ctx, 'home')}

${cv.basics.summary ?? ''}

Key facts (${asOf(ctx).replace(/\.$/, '')}):

${proofList(ctx)}

Identity: ${cv.identifiers.map(id => `${id.name} ${id.value}`).join('; ')}. Main site: ${cv.basics.url}. This site: ${origin}/.

## Pages

${pages}

## Peer-reviewed and accepted research

${papers}

## Featured work

${featured}

## Profiles

${identityList(ctx)}

## Optional

- [Everything in one file](${origin}/llms-full.txt): all pages above, concatenated.
- [Structured profile](${origin}/llms.json): the same facts as JSON.
${preprints}
`
}

/** /llms-full.txt: every page in one file. */
export function llmsFullTxt(cv: CV, origin: string): string {
  return (Object.keys(PAGE_PATHS) as MarkdownPage[])
    .map(page => pageMarkdown(cv, origin, page))
    .join('\n\n')
}

/** /llms.json: the same facts as structured data. */
export function llmsJson(cv: CV, origin: string): Record<string, unknown> {
  return {
    version: '1.0',
    name: cv.basics.name,
    description: `${cv.basics.name} is ${cv.basics.label}. ${cv.hero.description ?? ''}`.trim(),
    url: `${origin}/`,
    updated: cv.recognition?.asOf,
    language: cv.site.lang,
    resources: {
      llms_txt: `${origin}/llms.txt`,
      llms_full_txt: `${origin}/llms-full.txt`,
      sitemap: `${origin}/sitemap-index.xml`,
    },
    person: {
      name: cv.basics.name,
      alternate_names: ['Ranil Mukesh M J', 'Ranil Mukesh', 'Ranil MJ'],
      title: cv.basics.label,
      summary: cv.basics.summary,
      main_site: cv.basics.url,
      email: cv.basics.email,
      identifiers: cv.identifiers,
      profiles: cv.basics.profiles.map(({ network, username, url }) => ({ network, username, url })),
      organisations: cv.work.map(job => ({ name: job.name, role: job.position, url: job.url })),
      education: cv.education.map(school => ({ institution: school.institution, degree: `${school.studyType}, ${school.area}` })),
    },
    proof: cv.recognition,
    pages: (Object.keys(PAGE_PATHS) as MarkdownPage[]).map(page => ({
      title: PAGE_TITLES[page],
      url: `${origin}${PAGE_PATHS[page]}`,
      markdown: markdownUrl(origin, page),
      description: PAGE_NOTES[page],
    })),
    projects: cv.projects.map(project => ({
      name: project.name,
      description: project.description,
      featured: Boolean(project.featured),
      highlights: project.highlights ?? [],
      url: project.url,
      code: project.github,
    })),
    publications: cv.publications.map(paper => ({
      title: paper.name,
      status: paper.status,
      venue: paper.publisher,
      date: paper.releaseDate,
      doi: paper.doi,
      authors: paper.authors,
      first_author: Boolean(paper.firstAuthor),
      award: paper.award,
      url: paper.doi
        ? `https://doi.org/${paper.doi}`
        : paper.url,
      summary: paper.summary,
    })),
    articles: cv.articles,
    awards: cv.awards,
    certifications: cv.certificates.map(({ name, issuer, date, url }) => ({ name, issuer, date, url })),
    skills: cv.skills.map(({ name, category }) => ({ name, category })),
  }
}
