import etag from '../../packages/etag/src'

describe('etag(entity)', () => {
  it('should require an entity', () => {
    try {
      etag(undefined)
    } catch (e) {
      expect((e as TypeError).message).toBe('argument entity is required')
    }
  })
  it('should generate a strong ETag', () => {
    expect(etag('beep boop')).toBe('"9-fINXV39R1PCo05OqGqr7KIY9lCE"')
  })
  it('should work for empty string', function () {
    expect(etag('')).toBe('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"')
  })
  it('should work containing Unicode', function () {
    expect(etag('论')).toBe('"3-QkSKq8sXBjHL2tFAZknA2n6LYzM"')
    expect(etag('论', { weak: true })).toBe('W/"3-QkSKq8sXBjHL2tFAZknA2n6LYzM"')
  })
})
