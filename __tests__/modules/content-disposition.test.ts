import { contentDisposition, parse, ContentDisposition } from '../../packages/content-disposition/src'

describe('contentDisposition()', () => {
  it('should create an attachment header', () => {
    expect(contentDisposition()).toBe('attachment')
  })
})

describe('contentDisposition(filename)', () => {
  it('should require a string', () => {
    expect(contentDisposition.bind(null, 42)).toThrow(/filename.*string/)
  })

  it('should create a header with file name', () => {
    expect(contentDisposition('plans.pdf')).toBe('attachment; filename="plans.pdf"')
  })

  it('should use the basename of the string', () => {
    expect(contentDisposition('/path/to/plans.pdf')).toBe('attachment; filename="plans.pdf"')
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
  it('should require a string', () => {
    try {
      parse(null as string)
    } catch (e) {
      expect(e.message).toBe('argument string is required')
    }
  })
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
    // TODO: copypaste tests from https://github.com/jshttp/content-disposition/blob/master/test/test.js#L258-L278
    it('should lower-case parameter name', () => {
      expect(parse('attachment; FILENAME="plans.pdf"')).toStrictEqual(
        new ContentDisposition('attachment', { filename: 'plans.pdf' })
      )
    })
  })
})
