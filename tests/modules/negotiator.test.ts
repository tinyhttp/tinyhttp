import { describe, expect, it } from 'vitest'
import { Negotiator } from '../../packages/accepts/src/negotiator'

function createRequest(headers: Record<string, string | undefined> = {}) {
  return { headers }
}

describe('Negotiator', () => {
  describe('charsets()', () => {
    it('should return * when no Accept-Charset header', () => {
      const negotiator = new Negotiator(createRequest())
      expect(negotiator.charsets()).toEqual(['*'])
    })

    it('should parse Accept-Charset header', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'utf-8, iso-8859-1' }))
      expect(negotiator.charsets()).toEqual(['utf-8', 'iso-8859-1'])
    })

    it('should sort by quality value', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'utf-8;q=0.5, iso-8859-1' }))
      expect(negotiator.charsets()).toEqual(['iso-8859-1', 'utf-8'])
    })

    it('should filter by provided charsets', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'utf-8, iso-8859-1' }))
      expect(negotiator.charsets(['iso-8859-1'])).toEqual(['iso-8859-1'])
    })

    it('should return empty array when no match', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'utf-8' }))
      expect(negotiator.charsets(['iso-8859-1'])).toEqual([])
    })

    it('should handle wildcard *', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': '*' }))
      expect(negotiator.charsets(['utf-8', 'iso-8859-1'])).toEqual(['utf-8', 'iso-8859-1'])
    })

    it('should exclude q=0 charsets', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'utf-8, iso-8859-1;q=0' }))
      expect(negotiator.charsets()).toEqual(['utf-8'])
    })

    it('should handle case-insensitive matching', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-charset': 'UTF-8' }))
      expect(negotiator.charsets(['utf-8'])).toEqual(['utf-8'])
    })
  })

  describe('encodings()', () => {
    it('should return identity when no Accept-Encoding header', () => {
      const negotiator = new Negotiator(createRequest())
      expect(negotiator.encodings()).toEqual(['identity'])
    })

    it('should parse Accept-Encoding header', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip, deflate' }))
      expect(negotiator.encodings()).toContain('gzip')
      expect(negotiator.encodings()).toContain('deflate')
    })

    it('should sort by quality value', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip;q=0.5, deflate' }))
      const encodings = negotiator.encodings()
      expect(encodings.indexOf('deflate')).toBeLessThan(encodings.indexOf('gzip'))
    })

    it('should filter by provided encodings', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip, deflate' }))
      expect(negotiator.encodings(['gzip'])).toEqual(['gzip'])
    })

    it('should return empty array when no match', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip' }))
      expect(negotiator.encodings(['br'])).toEqual([])
    })

    it('should handle wildcard *', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': '*' }))
      expect(negotiator.encodings(['gzip', 'deflate'])).toEqual(['gzip', 'deflate'])
    })

    it('should always include identity by default', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip' }))
      expect(negotiator.encodings()).toContain('identity')
    })

    it('should exclude identity when q=0', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-encoding': 'gzip, identity;q=0' }))
      expect(negotiator.encodings()).not.toContain('identity')
    })
  })

  describe('languages()', () => {
    it('should return * when no Accept-Language header', () => {
      const negotiator = new Negotiator(createRequest())
      expect(negotiator.languages()).toEqual(['*'])
    })

    it('should parse Accept-Language header', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en, es' }))
      expect(negotiator.languages()).toEqual(['en', 'es'])
    })

    it('should sort by quality value', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en;q=0.5, es' }))
      expect(negotiator.languages()).toEqual(['es', 'en'])
    })

    it('should filter by provided languages', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en, es, fr' }))
      expect(negotiator.languages(['es', 'fr'])).toEqual(['es', 'fr'])
    })

    it('should return empty array when no match', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en' }))
      expect(negotiator.languages(['fr'])).toEqual([])
    })

    it('should handle wildcard *', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': '*' }))
      expect(negotiator.languages(['en', 'es'])).toEqual(['en', 'es'])
    })

    it('should handle language tags with subtags', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en-US, en-GB' }))
      expect(negotiator.languages()).toEqual(['en-US', 'en-GB'])
    })

    it('should match language prefix', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en' }))
      expect(negotiator.languages(['en-US'])).toEqual(['en-US'])
    })

    it('should prefer exact match over prefix match', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en-US, en;q=0.8' }))
      expect(negotiator.languages(['en', 'en-US'])).toEqual(['en-US', 'en'])
    })

    it('should exclude q=0 languages', () => {
      const negotiator = new Negotiator(createRequest({ 'accept-language': 'en, es;q=0' }))
      expect(negotiator.languages()).toEqual(['en'])
    })
  })

  describe('mediaTypes()', () => {
    it('should return */* when no Accept header', () => {
      const negotiator = new Negotiator(createRequest())
      expect(negotiator.mediaTypes()).toEqual(['*/*'])
    })

    it('should parse Accept header', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html, application/json' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html', 'application/json'])
    })

    it('should sort by quality value', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;q=0.5, application/json' }))
      expect(negotiator.mediaTypes()).toEqual(['application/json', 'text/html'])
    })

    it('should filter by provided media types', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html, application/json' }))
      expect(negotiator.mediaTypes(['application/json'])).toEqual(['application/json'])
    })

    it('should return empty array when no match', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html' }))
      expect(negotiator.mediaTypes(['application/json'])).toEqual([])
    })

    it('should handle wildcard */*', () => {
      const negotiator = new Negotiator(createRequest({ accept: '*/*' }))
      expect(negotiator.mediaTypes(['text/html', 'application/json'])).toEqual(['text/html', 'application/json'])
    })

    it('should handle type wildcard */subtype', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/*' }))
      expect(negotiator.mediaTypes(['text/html', 'text/plain'])).toEqual(['text/html', 'text/plain'])
    })

    it('should not match type wildcard for different types', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/*' }))
      expect(negotiator.mediaTypes(['application/json'])).toEqual([])
    })

    it('should exclude q=0 media types', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html, application/json;q=0' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html'])
    })

    it('should handle media type parameters', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;level=1' }))
      // When accept has parameters, it only matches if provided type also has those params
      // or if the accept uses wildcard params
      expect(negotiator.mediaTypes(['text/html;level=1'])).toEqual(['text/html;level=1'])
    })

    it('should not match when media type parameters differ', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;level=1' }))
      // Parameters must match - level=2 doesn't match level=1
      expect(negotiator.mediaTypes(['text/html;level=2'])).toEqual([])
    })

    it('should handle quoted parameters', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;charset="utf-8"' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html'])
    })

    it('should handle comma inside quoted parameter', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;foo="a,b", application/json' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html', 'application/json'])
    })

    it('should handle semicolon inside quoted parameter', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;foo="a;b"' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html'])
    })

    it('should handle multiple parameters', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;level=1;charset=utf-8' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html'])
    })

    it('should prefer more specific media types', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/*, text/html' }))
      const types = negotiator.mediaTypes(['text/html', 'text/plain'])
      expect(types[0]).toBe('text/html')
    })
  })

  describe('edge cases', () => {
    it('should handle empty header value', () => {
      const negotiator = new Negotiator(createRequest({ accept: '' }))
      expect(negotiator.mediaTypes()).toEqual([])
    })

    it('should handle whitespace in header', () => {
      const negotiator = new Negotiator(createRequest({ accept: '  text/html  ,  application/json  ' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html', 'application/json'])
    })

    it('should handle malformed quality value', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html;q=invalid' }))
      // Should treat as NaN and filter out
      expect(negotiator.mediaTypes()).toEqual([])
    })

    it('should handle duplicate entries', () => {
      const negotiator = new Negotiator(createRequest({ accept: 'text/html, text/html' }))
      expect(negotiator.mediaTypes()).toEqual(['text/html', 'text/html'])
    })

    it('should handle array headers (joined with comma)', () => {
      const negotiator = new Negotiator({ headers: { accept: ['text/html', 'application/json'] } })
      expect(negotiator.mediaTypes()).toEqual(['text/html', 'application/json'])
    })
  })
})
