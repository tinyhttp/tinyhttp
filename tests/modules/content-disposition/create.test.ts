import { create } from '@tinyhttp/content-disposition'
import { assert, describe, it } from 'vitest'

describe('create()', () => {
  it('should create an attachment header', () => {
    assert.strictEqual(create(), 'attachment')
  })
})

describe('create(filename)', () => {
  it('should create a header with file name', () => {
    assert.strictEqual(create('plans.pdf'), 'attachment; filename=plans.pdf')
  })

  it('should create a header with empty file name', () => {
    assert.strictEqual(create(''), 'attachment; filename=""')
  })

  it('should preserve a posix path', () => {
    assert.strictEqual(create('/path/to/plans.pdf'), 'attachment; filename="/path/to/plans.pdf"')
  })

  it('should preserve a windows path', () => {
    assert.strictEqual(create('\\path\\to\\plans.pdf'), 'attachment; filename="\\\\path\\\\to\\\\plans.pdf"')
  })

  it('should preserve a windows path with drive letter', () => {
    assert.strictEqual(create('C:\\path\\to\\plans.pdf'), 'attachment; filename="C:\\\\path\\\\to\\\\plans.pdf"')
  })

  it('should preserve a posix path with trailing slash', () => {
    assert.strictEqual(create('/path/to/plans.pdf/'), 'attachment; filename="/path/to/plans.pdf/"')
  })

  it('should preserve a windows path with trailing slash', () => {
    assert.strictEqual(create('\\path\\to\\plans.pdf\\'), 'attachment; filename="\\\\path\\\\to\\\\plans.pdf\\\\"')
  })

  it('should preserve a windows path with drive letter and trailing slash', () => {
    assert.strictEqual(create('C:\\path\\to\\plans.pdf\\'), 'attachment; filename="C:\\\\path\\\\to\\\\plans.pdf\\\\"')
  })

  it('should preserve a posix path with trailing slashes', () => {
    assert.strictEqual(create('/path/to/plans.pdf///'), 'attachment; filename="/path/to/plans.pdf///"')
  })

  it('should preserve a windows path with trailing slashes', () => {
    assert.strictEqual(
      create('\\path\\to\\plans.pdf\\\\\\'),
      'attachment; filename="\\\\path\\\\to\\\\plans.pdf\\\\\\\\\\\\"'
    )
  })

  it('should preserve a windows path with drive letter and trailing slashes', () => {
    assert.strictEqual(
      create('C:\\path\\to\\plans.pdf\\\\\\'),
      'attachment; filename="C:\\\\path\\\\to\\\\plans.pdf\\\\\\\\\\\\"'
    )
  })

  describe('when "filename" is US-ASCII', () => {
    it('should only include filename parameter', () => {
      assert.strictEqual(create('plans.pdf'), 'attachment; filename=plans.pdf')
    })

    it('should escape quotes', () => {
      assert.strictEqual(create('the "plans".pdf'), 'attachment; filename="the \\"plans\\".pdf"')
    })
  })

  describe('when "filename" is not US-ASCII', () => {
    it('should include filename* parameter for ISO-8859-1', () => {
      assert.strictEqual(
        create('«plans».pdf'),
        'attachment; filename="?plans?.pdf"; filename*=UTF-8\'\'%C2%ABplans%C2%BB.pdf'
      )
    })

    it('should include filename* parameter for ISO-8859-1 with quotes', () => {
      assert.strictEqual(
        create('the "plans" (1µ).pdf'),
        'attachment; filename="the \\"plans\\" (1?).pdf"; filename*=UTF-8\'\'the%20%22plans%22%20%281%C2%B5%29.pdf'
      )
    })

    it('should include filename* parameter for latin characters with diacritics', () => {
      assert.strictEqual(create('foo-ä.html'), 'attachment; filename="foo-?.html"; filename*=UTF-8\'\'foo-%C3%A4.html')
    })
  })

  describe('when "filename" is Unicode', () => {
    it('should include filename* parameter', () => {
      assert.strictEqual(
        create('планы.pdf'),
        'attachment; filename="?????.pdf"; filename*=UTF-8\'\'%D0%BF%D0%BB%D0%B0%D0%BD%D1%8B.pdf'
      )
    })

    it('should include filename fallback', () => {
      assert.strictEqual(
        create('£ and € rates.pdf'),
        'attachment; filename="? and ? rates.pdf"; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf'
      )
      assert.strictEqual(
        create('€ rates.pdf'),
        'attachment; filename="? rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf'
      )
    })

    it('should encode special characters', () => {
      assert.strictEqual(
        create("€'*%().pdf"),
        "attachment; filename=\"?'*%().pdf\"; filename*=UTF-8''%E2%82%AC%27%2A%25%28%29.pdf"
      )
    })
  })

  describe('when "filename" contains hex escape', () => {
    it('should keep a simple filename', () => {
      assert.strictEqual(
        create('the%20plans.pdf'),
        "attachment; filename=the%20plans.pdf; filename*=UTF-8''the%2520plans.pdf"
      )
    })

    it('should handle Unicode', () => {
      assert.strictEqual(
        create('€%20£.pdf'),
        'attachment; filename="?%20?.pdf"; filename*=UTF-8\'\'%E2%82%AC%2520%C2%A3.pdf'
      )
    })
  })
})

describe('create(filename, options)', () => {
  describe('with "fallback" option', () => {
    it('should default to true', () => {
      assert.strictEqual(
        create('€ rates.pdf'),
        'attachment; filename="? rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf'
      )
    })

    describe('when "false"', () => {
      it('should not generate US-ASCII fallback', () => {
        assert.strictEqual(
          create('£ and € rates.pdf', { fallback: false }),
          "attachment; filename*=UTF-8''%C2%A3%20and%20%E2%82%AC%20rates.pdf"
        )
      })

      it('should not generate fallback for Unicode filename', () => {
        assert.strictEqual(
          create('планы.pdf', { fallback: false }),
          "attachment; filename*=UTF-8''%D0%BF%D0%BB%D0%B0%D0%BD%D1%8B.pdf"
        )
      })

      it('should not use filename for ISO-8859-1 filename', () => {
        assert.strictEqual(
          create('£ rates.pdf', { fallback: false }),
          "attachment; filename*=UTF-8''%C2%A3%20rates.pdf"
        )
      })
    })

    describe('when "true"', () => {
      it('should generate US-ASCII fallback', () => {
        assert.strictEqual(
          create('£ and € rates.pdf', { fallback: true }),
          'attachment; filename="? and ? rates.pdf"; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf'
        )
      })

      it('should generate fallback for ISO-8859-1 filename', () => {
        assert.strictEqual(
          create('£ rates.pdf', { fallback: true }),
          'attachment; filename="? rates.pdf"; filename*=UTF-8\'\'%C2%A3%20rates.pdf'
        )
      })
    })

    describe('when a string', () => {
      it('should require a US-ASCII string', () => {
        assert.throws(
          create.bind(null, '£ rates.pdf', {
            fallback: '£ rates.pdf'
          }),
          /fallback.*us-ascii/i
        )
      })

      it('should use as US-ASCII fallback', () => {
        assert.strictEqual(
          create('£ and € rates.pdf', {
            fallback: 'GBP and EURO rates.pdf'
          }),
          'attachment; filename="GBP and EURO rates.pdf"; filename*=UTF-8\'\'%C2%A3%20and%20%E2%82%AC%20rates.pdf'
        )
      })

      it('should use as fallback even when filename is not US-ASCII', () => {
        assert.strictEqual(
          create('"£ rates".pdf', { fallback: 'GBP rates.pdf' }),
          'attachment; filename="GBP rates.pdf"; filename*=UTF-8\'\'%22%C2%A3%20rates%22.pdf'
        )
      })

      it('should do nothing if equal to filename', () => {
        assert.strictEqual(create('plans.pdf', { fallback: 'plans.pdf' }), 'attachment; filename=plans.pdf')
      })

      it('should preserve a posix fallback path', () => {
        assert.strictEqual(
          create('€ rates.pdf', {
            fallback: '/path/to/EURO rates.pdf'
          }),
          'attachment; filename="/path/to/EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf'
        )
      })

      it('should preserve a windows fallback path', () => {
        assert.strictEqual(
          create('€ rates.pdf', {
            fallback: '\\path\\to\\EURO rates.pdf'
          }),
          'attachment; filename="\\\\path\\\\to\\\\EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf'
        )
      })

      it('should preserve a windows fallback path with drive letter', () => {
        assert.strictEqual(
          create('€ rates.pdf', {
            fallback: 'C:\\path\\to\\EURO rates.pdf'
          }),
          'attachment; filename="C:\\\\path\\\\to\\\\EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf'
        )
      })

      it('should do nothing without filename option', () => {
        assert.strictEqual(create(undefined, { fallback: 'plans.pdf' }), 'attachment')
      })
    })
  })

  describe('with "type" option', () => {
    it('should default to attachment', () => {
      assert.strictEqual(create(), 'attachment')
    })

    it('should require a valid type', () => {
      assert.throws(create.bind(null, undefined, { type: 'invalid;type' }), /Invalid type: invalid;type/)
    })

    it('should create a header with inline type', () => {
      assert.strictEqual(create(undefined, { type: 'inline' }), 'inline')
    })

    it('should create a header with inline type & filename', () => {
      assert.strictEqual(create('plans.pdf', { type: 'inline' }), 'inline; filename=plans.pdf')
    })

    it('should preserve type casing', () => {
      assert.strictEqual(create(undefined, { type: 'INLINE' }), 'INLINE')
    })
  })
})
