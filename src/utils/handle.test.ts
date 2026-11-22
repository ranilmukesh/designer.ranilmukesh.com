import { describe, expect, it } from 'vitest'
import { profileHandle } from './handle'

describe('profileHandle', () => {
  it('prefixes social handles', () => {
    expect(profileHandle('ranilmukesh')).toBe('@ranilmukesh')
  })

  it('leaves identifiers and names alone', () => {
    expect(profileHandle('0009-0008-0768-4106')).toBe('0009-0008-0768-4106')
    expect(profileHandle('QDO-4615-2026')).toBe('QDO-4615-2026')
    expect(profileHandle('Claude Certified Architect')).toBe('Claude Certified Architect')
  })
})
