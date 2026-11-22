// Direct answers to the questions people (and answer engines) ask about the owner. Built from cv.json,
// so every figure matches the rest of the site. Rendered on /credentials/, as FAQPage markup and in llms.txt.
import type { CV } from './schema'

export interface QuickAnswer {
  question: string
  answer: string
}

function list(items: string[]) {
  return items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

export function quickAnswers(cv: CV): QuickAnswer[] {
  const { basics } = cv
  const name = basics.name
  const companies = list(cv.work.map(job => job.name))
  const published = cv.publications.filter(paper => paper.status === 'published')
  const preprints = cv.publications.filter(paper => paper.status === 'preprint').length
  const reviews = cv.recognition?.items.find(item => /peer review/i.test(item.label))
  const certificates = cv.certificates.filter(certificate => certificate.featured).map(certificate => `${certificate.name} (${certificate.issuer.replace(/ via .*/, '')})`)
  const featured = cv.projects.filter(project => project.featured).map(project => project.name)
  const orcid = cv.identifiers.find(id => id.name === 'ORCID')
  const wos = cv.identifiers.find(id => /web of science/i.test(id.name))

  const answers: QuickAnswer[] = [
    {
      question: `Who is ${name}?`,
      answer: `${name} is ${basics.label}, based in Coimbatore, India. He architects governed, deterministic multi-agent AI systems for enterprises and publishes research on agent security, medical AI and edge AI.`,
    },
    {
      question: `What does ${name} build?`,
      answer: `As Co-Founder and CTO of ${companies}, he leads the architecture and engineering of production AI systems. Featured work: ${list(featured)}. All ${cv.projects.length} projects are listed at /work/.`,
    },
    {
      question: `What research has ${name} published?`,
      answer: `${published.length} peer-reviewed papers: ${list(published.map(paper => `“${paper.name}” (${[
        paper.publisher?.replace(/ \(.*\)$/, ''),
        paper.releaseDate?.slice(0, 4),
      ].filter(Boolean).join(', ')}${paper.firstAuthor ? ', first author' : ''}${paper.award
        ? `, ${paper.award}`
        : ''})`))}. A further ${preprints} pre-prints are listed at /research/.`,
    },
  ]
  if (reviews) {
    answers.push({
      question: `Is ${name} a peer reviewer?`,
      answer: `Yes. ${reviews.value} ${reviews.label.toLowerCase()} for the ${reviews.detail?.replace(/, on Web of Science$/, '') ?? 'journal'}, recorded on Web of Science${wos
        ? ` (ResearcherID ${wos.value})`
        : ''}.`,
    })
  }
  if (certificates.length) {
    answers.push({
      question: `What certifications does ${name} hold?`,
      answer: `${list(certificates)}, plus ${cv.certificates.length - certificates.length} further courses in machine learning, data science and cybersecurity. Each has a verification link on /credentials/.`,
    })
  }
  if (orcid) {
    answers.push({
      question: `How can I verify ${name}'s publications?`,
      answer: `Through ORCID ${orcid.value} (${orcid.url})${wos
        ? ` and Web of Science ResearcherID ${wos.value} (${wos.url})`
        : ''}. Journal and conference papers also carry DOIs on /research/.`,
    })
  }
  if (basics.email) {
    answers.push({
      question: `How do I contact ${name}?`,
      answer: `By email at ${basics.email}, or on LinkedIn. ${cv.hero.availability ?? ''}`.trim(),
    })
  }
  return answers
}
