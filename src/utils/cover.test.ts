import { describe, expect, it } from 'vitest'
import { clipAtWord } from './cover'

describe('clipAtWord', () => {
  it('keeps short text as it is', () => {
    expect(clipAtWord('PII REDACTION', 34)).toBe('PII REDACTION')
  })

  it('cuts at a word boundary and drops trailing punctuation', () => {
    expect(clipAtWord('AGENTS WEIGH CONDITION, DEMAND FORECAST AND VALUE', 34)).toBe('AGENTS WEIGH CONDITION, DEMAND…')
    expect(clipAtWord('“THREE RECORDS, NOT ONE”: WHERE DATA LIVES', 34)).toBe('“THREE RECORDS, NOT ONE”: WHERE…')
  })

  it('falls back to a hard cut for one very long word', () => {
    expect(clipAtWord('A'.repeat(50), 34)).toBe(`${'A'.repeat(33)}…`)
  })
})
