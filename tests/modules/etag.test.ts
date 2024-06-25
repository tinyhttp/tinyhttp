import { describe, expect, it } from 'vitest'
import { eTag } from '../../packages/etag/src'
import { Stats } from 'node:fs'

describe('etag(entity)', () => {
  it('should require an entity', () => {
    try {
      eTag(undefined)
    } catch (e) {
      expect((e as TypeError).message).toBe('argument entity is required')
    }
  })
  it('should generate a strong ETag', () => {
    expect(eTag('beep boop')).toBe('"9-fINXV39R1PCo05OqGqr7KIY9lCE"')
  })
  it('should work for empty string', () => {
    expect(eTag('')).toBe('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"')
  })
  it('should work containing Unicode', () => {
    expect(eTag('论')).toBe('"3-QkSKq8sXBjHL2tFAZknA2n6LYzM"')
    expect(eTag('论', { weak: true })).toBe('W/"3-QkSKq8sXBjHL2tFAZknA2n6LYzM"')
  })
  it('should reject number entities', () => {
    expect(() => eTag(<any>1)).toThrow('Received type number')
  })
  describe('Buffer', () => {
    it('should work on empty', () => {
      expect(eTag(Buffer.from(''))).toBe('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"')
    })
    it('should generate a strong ETag', () => {
      expect(eTag(Buffer.from('beep boop'))).toBe('"9-fINXV39R1PCo05OqGqr7KIY9lCE"')
    })
  })
  describe('fs.Stats', () => {
    it('should generate a weak ETag', () => {
      const stats = new Stats()
      stats.mtime = new Date(Date.UTC(2020, 1, 1))
      stats.size = 1024
      expect(eTag(stats)).toBe('W/"16ffe0c0c00-400"')
    })
  })
  describe('weak', () => {
    it('should generate a weak ETag', () => {
      expect(eTag('beep boop', { weak: true })).toBe('W/"9-fINXV39R1PCo05OqGqr7KIY9lCE"')
    })
    it('should generate a strong ETag', () => {
      expect(eTag('beep boop', { weak: false })).toBe('"9-fINXV39R1PCo05OqGqr7KIY9lCE"')
    })
  })
})
