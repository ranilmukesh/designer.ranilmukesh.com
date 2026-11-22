// schema.org graph for every page. One Person entity, shared with ranilmukesh.com through a stable
// @id, so search engines and AI crawlers see one identity, with its identifiers and proof attached.
import type { CV } from './schema'
import { quickAnswers } from './quick-answers'

export type PageKind = 'home' | 'work' | 'research' | 'writing' | 'expertise' | 'credentials'

interface PageInput {
  kind: PageKind
  /** Absolute canonical URL of this page. */
  canonical: string
  /** Absolute origin of this site, e.g. https://design.ranilmukesh.com */
  origin: string
  title: string
  description: string
  lang: string
  /** ISO date of the last content check, used as dateModified. */
  modified: string
}

type Node = Record<string, unknown>

const PAGE_NAMES: Record<Exclude<PageKind, 'home'>, string> = {
  work: 'Work',
  research: 'Research',
  writing: 'Writing',
  expertise: 'Expertise',
  credentials: 'Credentials',
}

const statusName = { published: 'Published', accepted: 'Accepted', preprint: 'Preprint' } as const

/** The person's @id lives on the main domain so both sites describe the same entity. */
function personId(cv: CV): string {
  return new URL('/#person', cv.basics.url ?? cv.site.url).href
}

function isSelf(cv: CV, author: string) {
  const own = cv.basics.name.toLowerCase().replace(/[^a-z]/g, '')
  const candidate = author.toLowerCase().replace(/[^a-z]/g, '')
  return candidate === own || candidate.startsWith(own.slice(0, 10))
}

function organisation(name: string, url?: string): Node {
  return {
    '@type': 'Organization',
    name,
    ...(url
      ? { url }
      : {}),
  }
}

function person(cv: CV, origin: string): Node {
  const { basics } = cv
  const certificates = cv.certificates.filter(certificate => certificate.featured)
  return {
    '@type': 'Person',
    '@id': personId(cv),
    'name': basics.name,
    'alternateName': ['Ranil Mukesh M J', 'Ranil Mukesh', 'Ranil MJ'],
    'jobTitle': basics.label,
    'description': basics.summary,
    'url': basics.url,
    'mainEntityOfPage': `${origin}/`,
    'email': basics.email
      ? `mailto:${basics.email}`
      : undefined,
    'image': `${origin}/og.png`,
    'sameAs': [
      ...new Set([
        origin,
        basics.url,
        ...basics.profiles.map(profile => profile.url),
      ].filter(Boolean)),
    ],
    'identifier': cv.identifiers.map(id => ({
      '@type': 'PropertyValue',
      'propertyID': id.name,
      'value': id.value,
      'url': id.url,
    })),
    'worksFor': cv.work.map(job => organisation(job.name, job.url)),
    'hasOccupation': cv.work.map(job => ({
      '@type': 'Role',
      'roleName': job.position,
      'worksFor': organisation(job.name, job.url),
    })),
    'alumniOf': cv.education.map(school => ({ '@type': 'CollegeOrUniversity', 'name': school.institution })),
    'knowsAbout': [
      ...new Set(cv.skills.map(skill => skill.category).filter(Boolean)),
      ...cv.skills.slice(0, 18).map(skill => skill.name),
    ],
    'award': cv.awards.map(award => award.title),
    'hasCredential': certificates.map(certificate => ({
      '@type': 'EducationalOccupationalCredential',
      'name': certificate.name,
      'credentialCategory': 'certification',
      'recognizedBy': organisation(certificate.issuer.replace(/ via .*/, '')),
      'url': certificate.url,
      ...(certificate.date
        ? { dateCreated: certificate.date }
        : {}),
    })),
  }
}

function scholarlyArticle(cv: CV, paper: CV['publications'][number]): Node {
  const conference = /conference|proceedings/i.test(paper.publisher ?? '')
  return {
    '@type': 'ScholarlyArticle',
    'headline': paper.name.slice(0, 110),
    'name': paper.name,
    'abstract': paper.summary,
    'keywords': paper.tags,
    'datePublished': paper.releaseDate,
    'creativeWorkStatus': statusName[paper.status],
    'url': paper.doi
      ? `https://doi.org/${paper.doi}`
      : paper.url,
    'sameAs': paper.doi && paper.url && !paper.url.includes(paper.doi)
      ? paper.url
      : undefined,
    'identifier': paper.doi
      ? { '@type': 'PropertyValue', 'propertyID': 'DOI', 'value': paper.doi }
      : undefined,
    'author': (paper.authors ?? [cv.basics.name]).map(author => isSelf(cv, author)
      ? {
          '@id': personId(cv),
        }
      : { '@type': 'Person', 'name': author }),
    'isPartOf': paper.publisher && !conference
      ? {
          '@type': 'Periodical',
          'name': paper.publisher,
          ...(paper.issn
            ? { issn: paper.issn }
            : {}),
        }
      : undefined,
    'publication': paper.publisher && conference
      ? { '@type': 'PublicationEvent', 'name': paper.publisher }
      : undefined,
    'award': paper.award,
  }
}

function itemList(name: string, items: Node[]): Node {
  return {
    '@type': 'ItemList',
    name,
    'numberOfItems': items.length,
    'itemListElement': items.map((item, index) => ({ '@type': 'ListItem', 'position': index + 1, item })),
  }
}

function mainContent(cv: CV, kind: PageKind): Node | undefined {
  const author = {
    '@id': personId(cv),
  }
  switch (kind) {
    case 'research':
      return itemList('Research papers', cv.publications.map(paper => scholarlyArticle(cv, paper)))
    case 'work':
      return itemList('Projects', cv.projects.map(project => ({
        '@type': project.github ? 'SoftwareSourceCode' : 'CreativeWork',
        'name': project.name,
        'description': project.description,
        'url': project.url ?? project.github,
        'codeRepository': project.github,
        author,
      })))
    case 'writing':
      return itemList('Articles', cv.articles.map(article => ({
        '@type': 'BlogPosting',
        'headline': article.title,
        'description': article.description,
        'datePublished': article.date,
        'url': article.url,
        author,
      })))
    case 'credentials':
      return itemList('Credentials', [
        ...cv.awards.map(award => ({
          '@type': 'CreativeWork',
          'name': award.title,
          'description': award.summary,
          'url': award.url,
          'dateCreated': award.date,
        })),
        ...cv.certificates.map(certificate => ({
          '@type': 'EducationalOccupationalCredential',
          'name': certificate.name,
          'credentialCategory': 'certification',
          'url': certificate.url,
          'dateCreated': certificate.date,
        })),
      ])
    default:
      return undefined
  }
}

/** Removes undefined values and empty arrays so the JSON stays clean. */
function prune(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter(item => item !== undefined)
    return items.length ? items : undefined
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [
      key,
      prune(item),
    ] as const).filter(([, item]) => item !== undefined)
    return entries.length
      ? Object.fromEntries(entries)
      : undefined
  }
  return value
}

export function buildStructuredData(cv: CV, page: PageInput): Record<string, unknown> {
  const websiteId = `${page.origin}/#website`
  const pageId = `${page.canonical}#webpage`
  const content = mainContent(cv, page.kind)
  const webPage: Node = {
    '@type': page.kind === 'home'
      ? 'ProfilePage'
      : page.kind === 'credentials'
        ? 'AboutPage'
        : 'CollectionPage',
    '@id': pageId,
    'url': page.canonical,
    'name': page.title,
    'description': page.description,
    'inLanguage': page.lang,
    'isPartOf': { '@id': websiteId },
    'about': {
      '@id': personId(cv),
    },
    'dateModified': page.modified,
    ...(page.kind === 'home'
      ? {
          mainEntity: {
            '@id': personId(cv),
          },
          dateCreated: '2026-11-01',
        }
      : {}),
    ...(content
      ? { mainEntity: content }
      : {}),
    ...(page.kind === 'home'
      ? {}
      : {
          breadcrumb: {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': cv.basics.name,
                'item': `${page.origin}/`,
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': PAGE_NAMES[page.kind],
                'item': page.canonical,
              },
            ],
          },
        }),
  }
  return prune({
    '@context': 'https://schema.org',
    '@graph': [
      person(cv, page.origin),
      {
        '@type': 'WebSite',
        '@id': websiteId,
        'url': `${page.origin}/`,
        'name': `${cv.basics.name} · Portfolio`,
        'inLanguage': page.lang,
        'author': {
          '@id': personId(cv),
        },
        'publisher': {
          '@id': personId(cv),
        },
      },
      webPage,
      ...(page.kind === 'credentials'
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${page.canonical}#quick-answers`,
              'url': `${page.canonical}#quick-answers`,
              'about': {
                '@id': personId(cv),
              },
              'mainEntity': quickAnswers(cv).map(item => ({
                '@type': 'Question',
                'name': item.question,
                'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
              })),
            },
          ]
        : []),
    ],
  }) as Record<string, unknown>
}
