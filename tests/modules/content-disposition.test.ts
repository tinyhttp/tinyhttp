import { describe, expect, it, vi } from 'vitest'
import { contentDisposition, parse, ContentDisposition } from '../../packages/content-disposition/src'

describe('contentDisposition()', () => {
  it('should create an attachment header', () => {
    expect(contentDisposition()).toBe('attachment')
  })
})

describe('contentDisposition(filename)', () => {
  it('should create a header with file name', () => {
    expect(contentDisposition('plans.pdf')).toBe('attachment; filename="plans.pdf"')
  })

  it('should use the basename of the string', () => {
    expect(contentDisposition('/path/to/plans.pdf')).toBe('attachment; filename="plans.pdf"')
  })
  it('should throw an error when non latin fallback is used', function () {
    expect.assertions(1)
    try {
      contentDisposition('index.ht', { type: 'html', fallback: 'ÇŞ' })
    } catch (e) {
      expect((e as Error).message).toBe('fallback must be ISO-8859-1 string')
    }
  })
  it('should use hasfallback', function () {
    expect(contentDisposition('index.ht', { type: 'html', fallback: 'html' })).toEqual(
      `html; filename="html"; filename*=UTF-8''index.ht`
    )
  })
  it('should use pencode fn', function () {
    expect(contentDisposition('inde(x.ht', { type: 'html', fallback: 'html' })).toEqual(
      // eslint-disable-next-line no-useless-escape
      `html; filename="html"; filename*=UTF-8\'\'inde%28x.ht`
    )
  })
  it('should throw an error when non string options.type is used', function () {
    expect.assertions(1)
    try {
      contentDisposition('index.ht', { type: { test: 'test' } as unknown as string })
    } catch (e) {
      expect((e as Error).message).toBe('invalid type')
    }
  })
  describe('when "filename" is US-ASCII', () => {
    it('should only include filename parameter', () => {
      expect(contentDisposition('plans.pdf')).toBe('attachment; filename="plans.pdf"')
    })

    it('should escape quotes', () => {
      expect(contentDisposition('the "plans".pdf')).toBe('attachment; filename="the \\"plans\\".pdf"')
    })
  })
})

describe('parse(string)', () => {
  describe('with type', () => {
    it('should throw on quoted value', () => {
      try {
        parse('"attachment"')
      } catch (e) {
        expect(e.message).toBe('invalid type format')
      }
    })
    it('should throw on trailing semi', () => {
      try {
        parse('attachment;')
      } catch (e) {
        expect(e.message).toBe('invalid parameter format')
      }
    })
    it('should parse "attachment"', () => {
      expect(parse('attachment')).toStrictEqual(new ContentDisposition('attachment', {}))
    })
    it('should parse "inline"', () => {
      expect(parse('inline')).toStrictEqual(new ContentDisposition('inline', {}))
    })
    it('should parse "form-data"', () => {
      expect(parse('form-data')).toStrictEqual(new ContentDisposition('form-data', {}))
    })
    it('should parse with trailing LWS', () => {
      expect(parse('attachment \t ')).toStrictEqual(new ContentDisposition('attachment', {}))
    })
    it('should normalize to lower-case', () => {
      expect(parse('ATTACHMENT')).toStrictEqual(new ContentDisposition('attachment', {}))
    })
  })
  describe('with parameters', () => {
    it('should throw on trailing semi', () => {
      try {
        parse('attachment; filename="rates.pdf";')
      } catch (e) {
        expect(e.message).toBe('invalid parameter format')
      }
    })
    it('should throw on invalid param name', () => {
      try {
        parse('attachment; filename@="rates.pdf"')
      } catch (e) {
        expect(e.message).toBe('invalid parameter format')
      }
    })
    it('should throw on missing param value', () => {
      try {
        parse('attachment; filename=')
      } catch (e) {
        expect(e.message).toBe('invalid parameter format')
      }
    })

    it('should reject invalid parameter value', function () {
      try {
        parse('attachment; filename=trolly,trains')
      } catch (e) {
        expect(e.message).toMatch(/invalid parameter format/)
      }
    })

    it('should reject invalid parameters', function () {
      try {
        parse('attachment; filename=total/; foo=bar')
      } catch (e) {
        expect(e.message).toMatch(/invalid parameter format/)
      }
    })

    it('should reject duplicate parameters', function () {
      try {
        parse('attachment; filename=foo; filename=bar')
      } catch (e) {
        expect(e.message).toMatch(/invalid duplicate parameter/)
      }
    })

    it('should reject missing type', function () {
      try {
        parse('filename="plans.pdf"')
      } catch (e) {
        expect(e.message).toMatch(/invalid type format/)
      }

      try {
        parse('; filename="plans.pdf"')
      } catch (e) {
        expect(e.message).toMatch(/invalid type format/)
      }
    })

    it('should lower-case parameter name', () => {
      expect(parse('attachment; FILENAME="plans.pdf"')).toStrictEqual(
        new ContentDisposition('attachment', { filename: 'plans.pdf' })
      )
    })

    it('should parse quoted parameter value', function () {
      expect(parse('attachment; filename="plans.pdf"')).toEqual({
        type: 'attachment',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should parse & unescape quoted value', function () {
      expect(parse('attachment; filename="the \\"plans\\".pdf"')).toEqual({
        type: 'attachment',
        parameters: { filename: 'the "plans".pdf' }
      })
    })

    it('should include all parameters', function () {
      expect(parse('attachment; filename="plans.pdf"; foo=bar')).toEqual({
        type: 'attachment',
        parameters: { filename: 'plans.pdf', foo: 'bar' }
      })
    })

    it('should parse parameters separated with any LWS', function () {
      expect(parse('attachment;filename="plans.pdf" \t;    \t\t foo=bar')).toEqual({
        type: 'attachment',
        parameters: { filename: 'plans.pdf', foo: 'bar' }
      })
    })

    it('should parse token filename', function () {
      expect(parse('attachment; filename=plans.pdf')).toEqual({
        type: 'attachment',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should parse ISO-8859-1 filename', function () {
      expect(parse('attachment; filename="£ rates.pdf"')).toEqual({
        type: 'attachment',
        parameters: { filename: '£ rates.pdf' }
      })
    })
    it('should throw error if decodedURI throws an error', () => {
      const cutomdecodeURIComponent = (encodedURIComponent: string) => {
        throw encodedURIComponent
      }
      vi.stubGlobal('decodeURIComponent', cutomdecodeURIComponent)
      expect.assertions(1)
      try {
        parse("attachment; filename*=UTF-8'en'%E2%82%AC%20rates.pdf")
      } catch (error) {
        expect(error).toBeDefined()
      }
      vi.unstubAllGlobals()
    })
  })
  describe('with extended parameters', function () {
    it('should reject quoted extended parameter value', function () {
      try {
        parse('attachment; filename*="UTF-8\'\'%E2%82%AC%20rates.pdf"')
      } catch (e) {
        expect(e.message).toMatch(/invalid extended.*value/)
      }
    })

    it('should parse UTF-8 extended parameter value', function () {
      expect(parse("attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf")).toEqual({
        type: 'attachment',
        parameters: { filename: '€ rates.pdf' }
      })
    })

    it('should parse ISO-8859-1 extended parameter value', function () {
      expect(parse("attachment; filename*=ISO-8859-1''%A3%20rates.pdf")).toEqual({
        type: 'attachment',
        parameters: { filename: '£ rates.pdf' }
      })
      expect(parse("attachment; filename*=ISO-8859-1''%82%20rates.pdf")).toEqual({
        type: 'attachment',
        parameters: { filename: '? rates.pdf' }
      })
    })

    it('should not be case-sensitive for charser', function () {
      expect(parse("attachment; filename*=utf-8''%E2%82%AC%20rates.pdf")).toEqual({
        type: 'attachment',
        parameters: { filename: '€ rates.pdf' }
      })
    })

    it('should reject unsupported charset', function () {
      try {
        parse("attachment; filename*=ISO-8859-2''%A4%20rates.pdf")
      } catch (e) {
        expect(e.message).toMatch(/unsupported charset/)
      }
    })

    it('should parse with embedded language', function () {
      expect(parse("attachment; filename*=UTF-8'en'%E2%82%AC%20rates.pdf")).toEqual({
        type: 'attachment',
        parameters: { filename: '€ rates.pdf' }
      })
    })

    it('should prefer extended parameter value', function () {
      expect(parse('attachment; filename="EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf')).toEqual({
        type: 'attachment',
        parameters: { filename: '€ rates.pdf' }
      })
      expect(parse('attachment; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf; filename="EURO rates.pdf"')).toEqual({
        type: 'attachment',
        parameters: { filename: '€ rates.pdf' }
      })
    })
  })
  describe('from TC 2231', function () {
    describe('Disposition-Type Inline', function () {
      it('should parse "inline"', function () {
        expect(parse('inline')).toEqual({
          type: 'inline',
          parameters: {}
        })
      })

      it('should reject ""inline""', function () {
        try {
          parse('"inline"')
        } catch (e) {
          expect(e.message).toMatch(/invalid type format/)
        }
      })

      it('should parse "inline; filename="foo.html""', function () {
        expect(parse('inline; filename="foo.html"')).toEqual({
          type: 'inline',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "inline; filename="Not an attachment!""', function () {
        expect(parse('inline; filename="Not an attachment!"')).toEqual({
          type: 'inline',
          parameters: { filename: 'Not an attachment!' }
        })
      })

      it('should parse "inline; filename="foo.pdf""', function () {
        expect(parse('inline; filename="foo.pdf"')).toEqual({
          type: 'inline',
          parameters: { filename: 'foo.pdf' }
        })
      })
    })
    describe('Disposition-Type Attachment', function () {
      it('should parse "attachment"', function () {
        expect(parse('attachment')).toEqual({
          type: 'attachment',
          parameters: {}
        })
      })

      it('should reject ""attachment""', function () {
        try {
          parse('"attachment')
        } catch (e) {
          expect(e.message).toMatch(/invalid type format/)
        }
      })

      it('should parse "ATTACHMENT"', function () {
        expect(parse('ATTACHMENT')).toEqual({
          type: 'attachment',
          parameters: {}
        })
      })

      it('should parse "attachment; filename="foo.html""', function () {
        expect(parse('attachment; filename="foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="0000000000111111111122222""', function () {
        expect(parse('attachment; filename="0000000000111111111122222"')).toEqual({
          type: 'attachment',
          parameters: { filename: '0000000000111111111122222' }
        })
      })

      it('should parse "attachment; filename="00000000001111111111222222222233333""', function () {
        expect(parse('attachment; filename="00000000001111111111222222222233333"')).toEqual({
          type: 'attachment',
          parameters: { filename: '00000000001111111111222222222233333' }
        })
      })

      it('should parse "attachment; filename="f\\oo.html""', function () {
        expect(parse('attachment; filename="f\\oo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="\\"quoting\\" tested.html""', function () {
        expect(parse('attachment; filename="\\"quoting\\" tested.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: '"quoting" tested.html' }
        })
      })

      it('should parse "attachment; filename="Here\'s a semicolon;.html""', function () {
        expect(parse('attachment; filename="Here\'s a semicolon;.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: "Here's a semicolon;.html" }
        })
      })

      it('should parse "attachment; foo="bar"; filename="foo.html""', function () {
        expect(parse('attachment; foo="bar"; filename="foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html', foo: 'bar' }
        })
      })

      it('should parse "attachment; foo="\\"\\\\";filename="foo.html""', function () {
        expect(parse('attachment; foo="\\"\\\\";filename="foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html', foo: '"\\' }
        })
      })

      it('should parse "attachment; FILENAME="foo.html""', function () {
        expect(parse('attachment; FILENAME="foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename=foo.html"', function () {
        expect(parse('attachment; filename=foo.html')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should reject "attachment; filename=foo,bar.html"', function () {
        try {
          parse('attachment; filename=foo,bar.html')
        } catch (e) {
          expect(e.message).toMatch(/invalid parameter format/)
        }
      })

      it('should reject "attachment; filename=foo.html ;"', function () {
        try {
          parse('attachment; filename=foo.html ;')
        } catch (e) {
          expect(e.message).toMatch(/invalid parameter format/)
        }
      })

      it('should reject "attachment; ;filename=foo"', function () {
        try {
          parse('attachment; ;filename=foo')
        } catch (e) {
          expect(e.message).toMatch(/invalid parameter format/)
        }
      })

      it('should reject "attachment; filename=foo bar.html"', function () {
        try {
          parse('attachment; filename=foo bar.html')
        } catch (e) {
          expect(e.message).toMatch(/invalid parameter format/)
        }
      })

      it("should parse \"attachment; filename='foo.bar'", function () {
        expect(parse("attachment; filename='foo.bar'")).toEqual({
          type: 'attachment',
          parameters: { filename: "'foo.bar'" }
        })
      })

      it('should parse "attachment; filename="foo-ä.html""', function () {
        expect(parse('attachment; filename="foo-ä.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo-ä.html' }
        })
      })

      it('should parse "attachment; filename="foo-Ã¤.html""', function () {
        expect(parse('attachment; filename="foo-Ã¤.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo-Ã¤.html' }
        })
      })

      it('should parse "attachment; filename="foo-%41.html""', function () {
        expect(parse('attachment; filename="foo-%41.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; filename="50%.html""', function () {
        expect(parse('attachment; filename="50%.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: '50%.html' }
        })
      })

      it('should parse "attachment; filename="foo-%\\41.html""', function () {
        expect(parse('attachment; filename="foo-%\\41.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; name="foo-%41.html""', function () {
        expect(parse('attachment; name="foo-%41.html"')).toEqual({
          type: 'attachment',
          parameters: { name: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; filename="ä-%41.html""', function () {
        expect(parse('attachment; filename="ä-%41.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'ä-%41.html' }
        })
      })

      it('should parse "attachment; filename="foo-%c3%a4-%e2%82%ac.html""', function () {
        expect(parse('attachment; filename="foo-%c3%a4-%e2%82%ac.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo-%c3%a4-%e2%82%ac.html' }
        })
      })

      it('should parse "attachment; filename ="foo.html""', function () {
        expect(parse('attachment; filename ="foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should reject "attachment; filename="foo.html"; filename="bar.html"', function () {
        expect(parse.bind(null, 'attachment; filename="foo.html"; filename="bar.html"')).toThrow(
          /invalid duplicate parameter/
        )
      })

      it('should reject "attachment; filename=foo[1](2).html"', function () {
        expect(parse.bind(null, 'attachment; filename=foo[1](2).html')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename=foo-ä.html"', function () {
        expect(parse.bind(null, 'attachment; filename=foo-ä.html')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename=foo-Ã¤.html"', function () {
        expect(parse.bind(null, 'attachment; filename=foo-Ã¤.html')).toThrow(/invalid parameter format/)
      })

      it('should reject "filename=foo.html"', function () {
        expect(parse.bind(null, 'filename=foo.html')).toThrow(/invalid type format/)
      })

      it('should reject "x=y; filename=foo.html"', function () {
        expect(parse.bind(null, 'x=y; filename=foo.html')).toThrow(/invalid type format/)
      })

      it('should reject ""foo; filename=bar;baz"; filename=qux"', function () {
        expect(parse.bind(null, '"foo; filename=bar;baz"; filename=qux')).toThrow(/invalid type format/)
      })

      it('should reject "filename=foo.html, filename=bar.html"', function () {
        expect(parse.bind(null, 'filename=foo.html, filename=bar.html')).toThrow(/invalid type format/)
      })

      it('should reject "; filename=foo.html"', function () {
        expect(parse.bind(null, '; filename=foo.html')).toThrow(/invalid type format/)
      })

      it('should reject ": inline; attachment; filename=foo.html', function () {
        expect(parse.bind(null, ': inline; attachment; filename=foo.html')).toThrow(/invalid type format/)
      })

      it('should reject "inline; attachment; filename=foo.html', function () {
        expect(parse.bind(null, 'inline; attachment; filename=foo.html')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; inline; filename=foo.html', function () {
        expect(parse.bind(null, 'attachment; inline; filename=foo.html')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename="foo.html".txt', function () {
        expect(parse.bind(null, 'attachment; filename="foo.html".txt')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename="bar', function () {
        expect(parse.bind(null, 'attachment; filename="bar')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename=foo"bar;baz"qux', function () {
        expect(parse.bind(null, 'attachment; filename=foo"bar;baz"qux')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename=foo.html, attachment; filename=bar.html', function () {
        expect(parse.bind(null, 'attachment; filename=foo.html, attachment; filename=bar.html')).toThrow(
          /invalid parameter format/
        )
      })

      it('should reject "attachment; foo=foo filename=bar', function () {
        expect(parse.bind(null, 'attachment; foo=foo filename=bar')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment; filename=bar foo=foo', function () {
        expect(parse.bind(null, 'attachment; filename=bar foo=foo')).toThrow(/invalid parameter format/)
      })

      it('should reject "attachment filename=bar', function () {
        expect(parse.bind(null, 'attachment filename=bar')).toThrow(/invalid type format/)
      })

      it('should reject "filename=foo.html; attachment', function () {
        expect(parse.bind(null, 'filename=foo.html; attachment')).toThrow(/invalid type format/)
      })

      it('should parse "attachment; xfilename=foo.html"', function () {
        expect(parse('attachment; xfilename=foo.html')).toEqual({
          type: 'attachment',
          parameters: { xfilename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="/foo.html""', function () {
        expect(parse('attachment; filename="/foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: '/foo.html' }
        })
      })

      it('should parse "attachment; filename="\\\\foo.html""', function () {
        expect(parse('attachment; filename="\\\\foo.html"')).toEqual({
          type: 'attachment',
          parameters: { filename: '\\foo.html' }
        })
      })
    })
  })
})
