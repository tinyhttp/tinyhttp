import { contentDisposition } from '../../packages/content-disposition/src'

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
