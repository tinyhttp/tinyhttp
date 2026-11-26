import { contentDisposition, create, parse } from '@tinyhttp/content-disposition'
import { describe, expect, it } from 'vitest'

describe('create(filename)', () => {
  it('should be exported as the deprecated contentDisposition alias', () => {
    expect(contentDisposition).toBe(create)
    expect(contentDisposition('plans.pdf')).toBe(create('plans.pdf'))
  })

  it('should not strip the directory from the filename', () => {
    // v1 stripped directories, v3 leaves this to the caller (e.g. res.attachment)
    expect(create('/path/to/plans.pdf')).toBe('attachment; filename="/path/to/plans.pdf"')
  })

  it('should keep the default type and encode an empty filename as a quoted string', () => {
    expect(create()).toBe('attachment')
    expect(create('', { type: 'inline' })).toBe('inline; filename=""')
  })
})

describe('parse(string) DoS resistance', () => {
  const cases: [string, string][] = [
    ['long extended value', `attachment; filename*=UTF-8''${'a'.repeat(100_000)}`],
    ['long percent escapes', `attachment; filename*=UTF-8''${'%41'.repeat(50_000)}`],
    ['long unterminated quoted string', `attachment; filename="${'a'.repeat(100_000)}`],
    ['long parameter name', `attachment; ${'a'.repeat(100_000)}`],
    ['long type', 'a'.repeat(100_000)],
    ['many parameters', `attachment${'; a=b'.repeat(50_000)}`],
    ['many semicolons', `attachment${';'.repeat(100_000)}`],
    ['many quotes', `attachment${'""'.repeat(50_000)}`]
  ]

  for (const [name, header] of cases) {
    it(`should parse a ${name} in linear time`, () => {
      const start = performance.now()
      try {
        parse(header)
      } catch {
        // invalid input may throw, it just must not hang
      }
      expect(performance.now() - start).toBeLessThan(250)
    })
  }
})
