import { describe, expect, it } from 'vitest'
import { cv } from './cv'
import { quickAnswers } from './quick-answers'

describe('quickAnswers', () => {
  const answers = quickAnswers(cv)

  it('answers who, what, research, reviews, certifications, verification and contact', () => {
    expect(answers.map(item => item.question)).toHaveLength(7)
    expect(answers[0]!.question).toBe(`Who is ${cv.basics.name}?`)
  })

  it('takes every figure from cv.json', () => {
    const research = answers.find(item => item.question.startsWith('What research'))!.answer
    const published = cv.publications.filter(paper => paper.status === 'published').length
    expect(research.startsWith(`${published} peer-reviewed papers`)).toBe(true)
    expect(answers.find(item => item.question.startsWith('What does'))!.answer).toContain(`All ${cv.projects.length} projects`)
  })

  it('never overstates the journal', () => {
    expect(answers.map(item => item.answer).join(' ')).not.toMatch(/published in Nature\b/i)
  })
})
