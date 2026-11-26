import { format, parse } from '@tinyhttp/content-disposition'
import { assert, describe, it } from 'vitest'

describe('parse(string)', () => {
  describe('with duplicate parameters', () => {
    describe.each([false, true])('with multipart: %s', (multipart) => {
      it.each([
        ['"first%22.txt"', '"second.txt"'],
        ['"first%22.txt"', 'second.txt'],
        ['first.txt', '"second%22.txt"']
      ])('should keep %s before duplicate %s', (first, second) => {
        assert.deepEqual(
          parse(`attachment; filename=${first}; FILENAME=${second}`, {
            multipart
          }),
          {
            type: 'attachment',
            parameters: {
              filename: first === 'first.txt' ? 'first.txt' : multipart ? 'first".txt' : 'first%22.txt'
            }
          }
        )
      })

      it.each(['', '""'])('should preserve an empty first value (%s)', (first) => {
        assert.deepEqual(
          parse(`attachment; filename=${first}; filename=second`, {
            multipart
          }),
          {
            type: 'attachment',
            parameters: { filename: '' }
          }
        )
      })

      it('should parse a distinct parameter after a quoted duplicate containing a semicolon', () => {
        assert.deepEqual(
          parse('attachment; filename=first; filename="second;hidden=value"; name=last', { multipart }),
          {
            type: 'attachment',
            parameters: { filename: 'first', name: 'last' }
          }
        )
      })
    })

    it.each([
      ["UTF-8''first", "UTF-8''second", "UTF-8''first"],
      ['"first"', "UTF-8''second", 'first'],
      ["UTF-8''first", '"second"', "UTF-8''first"],
      ['"first"', '"second"', 'first']
    ])('should keep %s before extended duplicate %s with decoding disabled', (first, second, expected) => {
      assert.deepEqual(
        parse(`attachment; filename*= ${first}; FILENAME*=${second}`, {
          extended: false
        }),
        {
          type: 'attachment',
          parameters: { 'filename*': expected }
        }
      )
    })
  })

  describe('with only type', () => {
    it('should ignore leading spaces and tabs', () => {
      assert.deepEqual(parse(' \t attachment'), {
        type: 'attachment',
        parameters: {}
      })
    })

    it('should parse quoted value leniently', () => {
      assert.deepEqual(parse('"attachment"'), {
        type: '"attachment"',
        parameters: {}
      })
    })

    it('should ignore trailing semicolon', () => {
      assert.deepEqual(parse('attachment;'), {
        type: 'attachment',
        parameters: {}
      })
    })

    it('should parse "attachment"', () => {
      assert.deepEqual(parse('attachment'), {
        type: 'attachment',
        parameters: {}
      })
    })

    it('should parse "inline"', () => {
      assert.deepEqual(parse('inline'), {
        type: 'inline',
        parameters: {}
      })
    })

    it('should parse "form-data"', () => {
      assert.deepEqual(parse('form-data'), {
        type: 'form-data',
        parameters: {}
      })
    })

    it('should parse with trailing LWS', () => {
      assert.deepEqual(parse('attachment \t '), {
        type: 'attachment',
        parameters: {}
      })
    })

    it('should normalize to lower-case', () => {
      assert.deepEqual(parse('ATTACHMENT'), {
        type: 'attachment',
        parameters: {}
      })
    })

    it('should normalize non-ASCII characters to lower-case', () => {
      assert.deepEqual(parse('ATTÄCHMENT'), {
        type: 'attächment',
        parameters: {}
      })
    })
  })

  describe('with parameters', () => {
    it('should preserve whitespace within parameter names', () => {
      assert.deepEqual(parse('attachment; file \t name =plans.pdf'), {
        type: 'attachment',
        parameters: { 'file \t name': 'plans.pdf' }
      })
    })

    it('should ignore trailing semicolon', () => {
      assert.deepEqual(parse('attachment; filename="rates.pdf";'), {
        type: 'attachment',
        parameters: { filename: 'rates.pdf' }
      })
    })

    it('should preserve invalid parameter name', () => {
      assert.deepEqual(parse('attachment; filename@="rates.pdf"'), {
        type: 'attachment',
        parameters: { 'filename@': 'rates.pdf' }
      })
    })

    it('should treat missing parameter value as empty', () => {
      assert.deepEqual(parse('attachment; filename='), {
        type: 'attachment',
        parameters: { filename: '' }
      })
    })

    it('should preserve invalid parameter value', () => {
      assert.deepEqual(parse('attachment; filename=trolly,trains'), {
        type: 'attachment',
        parameters: { filename: 'trolly,trains' }
      })
    })

    it('should preserve otherwise invalid parameters', () => {
      assert.deepEqual(parse('attachment; filename=total/; foo=bar'), {
        type: 'attachment',
        parameters: { filename: 'total/', foo: 'bar' }
      })
    })

    it('should keep the first duplicate parameter', () => {
      assert.deepEqual(parse('attachment; filename=foo; filename=bar'), {
        type: 'attachment',
        parameters: { filename: 'foo' }
      })
    })

    it('should parse missing type leniently', () => {
      assert.deepEqual(parse('filename="plans.pdf"'), {
        type: 'filename="plans.pdf"',
        parameters: {}
      })
      assert.deepEqual(parse('; filename="plans.pdf"'), {
        type: '',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should lower-case parameter name', () => {
      assert.deepEqual(parse('attachment; FILENAME="plans.pdf"'), {
        type: 'attachment',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should lower-case non-ASCII parameter names', () => {
      assert.deepEqual(parse('attachment; FÖÖ=bar'), {
        type: 'attachment',
        parameters: { föö: 'bar' }
      })
    })

    it('should parse quoted parameter value', () => {
      assert.deepEqual(parse('attachment; filename="plans.pdf"'), {
        type: 'attachment',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should parse & unescape quoted value', () => {
      assert.deepEqual(parse('attachment; filename="the \\"plans\\".pdf"'), {
        type: 'attachment',
        parameters: { filename: 'the "plans".pdf' }
      })
    })

    it('should include all parameters', () => {
      assert.deepEqual(parse('attachment; filename="plans.pdf"; foo=bar'), {
        type: 'attachment',
        parameters: { filename: 'plans.pdf', foo: 'bar' }
      })
    })

    it('should parse parameters separated with any LWS', () => {
      assert.deepEqual(parse('attachment;filename="plans.pdf" \t;    \t\t foo=bar'), {
        type: 'attachment',
        parameters: { filename: 'plans.pdf', foo: 'bar' }
      })
    })

    it('should parse token filename', () => {
      assert.deepEqual(parse('attachment; filename=plans.pdf'), {
        type: 'attachment',
        parameters: { filename: 'plans.pdf' }
      })
    })

    it('should parse ISO-8859-1 filename', () => {
      assert.deepEqual(parse('attachment; filename="£ rates.pdf"'), {
        type: 'attachment',
        parameters: { filename: '£ rates.pdf' }
      })
    })
  })

  describe('with extended parameters', () => {
    it('should preserve quoted extended parameter value', () => {
      assert.deepEqual(parse('attachment; filename*="UTF-8\'\'%E2%82%AC%20rates.pdf"'), {
        type: 'attachment',
        parameters: { 'filename*': "UTF-8''%E2%82%AC%20rates.pdf" }
      })
    })

    it('should parse UTF-8 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '€ rates.pdf'
        }
      })
    })

    it('should parse UTF8 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=utf8''%E2%82%AC%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '€ rates.pdf'
        }
      })
    })

    it('should parse UTF-8 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '€ rates.pdf'
        }
      })
    })

    it('should ignore invalid percent-encodings in UTF-8 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8''%E4%20rates.pdf"), {
        type: 'attachment',
        parameters: { 'filename*': "UTF-8''%E4%20rates.pdf" }
      })
    })

    it('should parse ISO-8859-1 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=ISO-8859-1''%A3%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '£ rates.pdf'
        }
      })
    })

    it('should retain invalid latin1 bytes in ISO-8859-1 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=ISO-8859-1''%82%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '\x82 rates.pdf'
        }
      })
    })

    it('should parse iso-8859-1 extended parameter value containing ASCII only', () => {
      assert.deepEqual(parse("attachment; filename*=ISO-8859-1''ABC.pdf"), {
        type: 'attachment',
        parameters: {
          filename: 'ABC.pdf'
        }
      })
    })

    it('should ignore invalid percent-encodings in ISO-8859-1 extended parameter value', () => {
      assert.deepEqual(parse("attachment; filename*=ISO-8859-1''%A3%2rates.pdf"), {
        type: 'attachment',
        parameters: {
          'filename*': "ISO-8859-1''%A3%2rates.pdf"
        }
      })
    })

    it('should fall back to filename when ISO-8859-1 filename* is malformed', () => {
      assert.deepEqual(parse('attachment; filename="invoice.pdf"; filename*=ISO-8859-1\'\'report%2'), {
        type: 'attachment',
        parameters: {
          filename: 'invoice.pdf',
          'filename*': "ISO-8859-1''report%2"
        }
      })
    })

    it('should not be case-sensitive for charset', () => {
      assert.deepEqual(parse("attachment; filename*=utf-8''%E2%82%AC%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '€ rates.pdf'
        }
      })
    })

    it('should preserve unsupported charset as the original parameter', () => {
      assert.deepEqual(parse("attachment; filename*=ISO-8859-2''%A4%20rates.pdf"), {
        type: 'attachment',
        parameters: { 'filename*': "ISO-8859-2''%A4%20rates.pdf" }
      })
    })

    it('should parse with embedded language', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8'en'%E2%82%AC%20rates.pdf"), {
        type: 'attachment',
        parameters: {
          filename: '€ rates.pdf'
        }
      })
    })

    it.each([
      ["filename=fallback; filename*=UTF-8''preferred", 'preferred'],
      ["filename*=UTF-8''preferred; filename=fallback", 'preferred'],
      ["filename=fallback; filename*=UTF-8''preferred; filename=last", 'preferred'],
      ['filename=fallback; filename*=UTF-8\'\'preferred; filename="last"', 'preferred'],
      ['filename="fallback"; filename*=UTF-8\'\'preferred', 'preferred'],
      ['filename*=UTF-8\'\'preferred; filename="fallback"', 'preferred'],
      ['filename="fallback"; filename*=UTF-8\'\'preferred; filename=last', 'preferred'],
      ['filename="fallback"; filename*=UTF-8\'\'preferred; filename="last"', 'preferred'],
      ['filename="EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf', '€ rates.pdf'],
      ['filename*=UTF-8\'\'%E2%82%AC%20rates.pdf; filename="EURO rates.pdf"', '€ rates.pdf'],
      ['filename="foo-ae.html"; filename*=UTF-8\'\'foo-%c3%a4.html', 'foo-ä.html'],
      ['filename*=UTF-8\'\'foo-%c3%a4.html; filename="foo-ae.html"', 'foo-ä.html']
    ])('should prefer the extended filename in %s', (params, filename) => {
      assert.deepEqual(parse(`attachment; ${params}`), {
        type: 'attachment',
        parameters: { filename }
      })
    })

    it('should keep the first duplicate extended filename', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8''first.html; filename*=UTF-8''second.html"), {
        type: 'attachment',
        parameters: {
          filename: 'first.html'
        }
      })
    })

    it('should not treat a normalized extended key as a duplicate input key', () => {
      assert.deepEqual(parse("attachment; filename**=UTF-8''first.html; filename*=UTF-8''second.html"), {
        type: 'attachment',
        parameters: {
          'filename*': 'first.html',
          filename: 'second.html'
        }
      })
    })

    it.each([
      'fallback',
      '"fallback"'
    ])('should preserve a normalized extended value before an undecodable value (%s)', (fallback) => {
      assert.deepEqual(parse(`attachment; filename**=UTF-8''preferred; filename*=${fallback}`), {
        type: 'attachment',
        parameters: { 'filename*': 'preferred' }
      })
    })

    it('should ignore an unquoted extended duplicate after a quoted value', () => {
      assert.deepEqual(parse('attachment; filename*="first.html"; FILENAME*=UTF-8\'\'second.html'), {
        type: 'attachment',
        parameters: { 'filename*': 'first.html' }
      })
    })

    it('should ignore a quoted extended duplicate after an unquoted value', () => {
      assert.deepEqual(parse('attachment; filename*=UTF-8\'\'first.html; FILENAME*="second.html"'), {
        type: 'attachment',
        parameters: { filename: 'first.html' }
      })
    })

    it('should not decode a second duplicate extended filename when the first cannot be decoded', () => {
      assert.deepEqual(parse("attachment; filename*=UTF-8''%E4%20rates.pdf; filename*=UTF-8''second.html"), {
        type: 'attachment',
        parameters: { 'filename*': "UTF-8''%E4%20rates.pdf" }
      })
    })

    it('should keep fallback filename when extended parameter cannot be decoded', () => {
      assert.deepEqual(parse('attachment; filename="EURO rates.pdf"; filename*=ISO-8859-2\'\'%A4%20rates.pdf'), {
        type: 'attachment',
        parameters: {
          filename: 'EURO rates.pdf',
          'filename*': "ISO-8859-2''%A4%20rates.pdf"
        }
      })
    })

    describe('when "extended" option is false', () => {
      it('should preserve extended parameter value without decoding', () => {
        assert.deepEqual(
          parse("attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf", {
            extended: false
          }),
          {
            type: 'attachment',
            parameters: { 'filename*': "UTF-8''%E2%82%AC%20rates.pdf" }
          }
        )
      })

      it('should preserve both fallback and extended parameter values', () => {
        assert.deepEqual(
          parse('attachment; filename="EURO rates.pdf"; filename*=UTF-8\'\'%E2%82%AC%20rates.pdf', { extended: false }),
          {
            type: 'attachment',
            parameters: {
              filename: 'EURO rates.pdf',
              'filename*': "UTF-8''%E2%82%AC%20rates.pdf"
            }
          }
        )
      })
    })
  })

  describe('from TC 2231', () => {
    describe('Disposition-Type Inline', () => {
      it('should parse "inline"', () => {
        assert.deepEqual(parse('inline'), {
          type: 'inline',
          parameters: {}
        })
      })

      it('should parse ""inline"" leniently', () => {
        assert.deepEqual(parse('"inline"'), {
          type: '"inline"',
          parameters: {}
        })
      })

      it('should parse "inline; filename="foo.html""', () => {
        assert.deepEqual(parse('inline; filename="foo.html"'), {
          type: 'inline',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "inline; filename="Not an attachment!""', () => {
        assert.deepEqual(parse('inline; filename="Not an attachment!"'), {
          type: 'inline',
          parameters: { filename: 'Not an attachment!' }
        })
      })

      it('should parse "inline; filename="foo.pdf""', () => {
        assert.deepEqual(parse('inline; filename="foo.pdf"'), {
          type: 'inline',
          parameters: { filename: 'foo.pdf' }
        })
      })
    })

    describe('Disposition-Type Attachment', () => {
      it('should parse "attachment"', () => {
        assert.deepEqual(parse('attachment'), {
          type: 'attachment',
          parameters: {}
        })
      })

      it('should parse ""attachment"" leniently', () => {
        assert.deepEqual(parse('"attachment"'), {
          type: '"attachment"',
          parameters: {}
        })
      })

      it('should parse "ATTACHMENT"', () => {
        assert.deepEqual(parse('ATTACHMENT'), {
          type: 'attachment',
          parameters: {}
        })
      })

      it('should parse "attachment; filename="foo.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="0000000000111111111122222""', () => {
        assert.deepEqual(parse('attachment; filename="0000000000111111111122222"'), {
          type: 'attachment',
          parameters: { filename: '0000000000111111111122222' }
        })
      })

      it('should parse "attachment; filename="00000000001111111111222222222233333""', () => {
        assert.deepEqual(parse('attachment; filename="00000000001111111111222222222233333"'), {
          type: 'attachment',
          parameters: { filename: '00000000001111111111222222222233333' }
        })
      })

      it('should parse "attachment; filename="f\\oo.html""', () => {
        assert.deepEqual(parse('attachment; filename="f\\oo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="\\"quoting\\" tested.html""', () => {
        assert.deepEqual(parse('attachment; filename="\\"quoting\\" tested.html"'), {
          type: 'attachment',
          parameters: { filename: '"quoting" tested.html' }
        })
      })

      it('should parse "attachment; filename="Here\'s a semicolon;.html""', () => {
        assert.deepEqual(parse('attachment; filename="Here\'s a semicolon;.html"'), {
          type: 'attachment',
          parameters: { filename: "Here's a semicolon;.html" }
        })
      })

      it('should parse "attachment; foo="bar"; filename="foo.html""', () => {
        assert.deepEqual(parse('attachment; foo="bar"; filename="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html', foo: 'bar' }
        })
      })

      it('should parse "attachment; foo="\\"\\\\";filename="foo.html""', () => {
        assert.deepEqual(parse('attachment; foo="\\"\\\\";filename="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html', foo: '"\\' }
        })
      })

      it('should parse "attachment; FILENAME="foo.html""', () => {
        assert.deepEqual(parse('attachment; FILENAME="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename=foo.html"', () => {
        assert.deepEqual(parse('attachment; filename=foo.html'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should preserve commas in token values', () => {
        assert.deepEqual(parse('attachment; filename=foo,bar.html'), {
          type: 'attachment',
          parameters: { filename: 'foo,bar.html' }
        })
      })

      it('should ignore trailing semicolon after value', () => {
        assert.deepEqual(parse('attachment; filename=foo.html ;'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should skip empty parameter slots', () => {
        assert.deepEqual(parse('attachment; ;filename=foo'), {
          type: 'attachment',
          parameters: { filename: 'foo' }
        })
      })

      it('should preserve spaces in token values', () => {
        assert.deepEqual(parse('attachment; filename=foo bar.html'), {
          type: 'attachment',
          parameters: { filename: 'foo bar.html' }
        })
      })

      it('should trim trailing whitespace after spaces in token values', () => {
        assert.deepEqual(parse('attachment; filename=foo bar.html \t'), {
          type: 'attachment',
          parameters: { filename: 'foo bar.html' }
        })
      })

      it("should parse \"attachment; filename='foo.bar'", () => {
        assert.deepEqual(parse("attachment; filename='foo.bar'"), {
          type: 'attachment',
          parameters: { filename: "'foo.bar'" }
        })
      })

      it('should parse "attachment; filename="foo-ä.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo-ä.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo-ä.html' }
        })
      })

      it('should parse "attachment; filename="foo-Ã¤.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo-Ã¤.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo-Ã¤.html' }
        })
      })

      it('should parse "attachment; filename="foo-%41.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo-%41.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; filename="50%.html""', () => {
        assert.deepEqual(parse('attachment; filename="50%.html"'), {
          type: 'attachment',
          parameters: { filename: '50%.html' }
        })
      })

      it('should parse "attachment; filename="foo-%\\41.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo-%\\41.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; name="foo-%41.html""', () => {
        assert.deepEqual(parse('attachment; name="foo-%41.html"'), {
          type: 'attachment',
          parameters: { name: 'foo-%41.html' }
        })
      })

      it('should parse "attachment; filename="ä-%41.html""', () => {
        assert.deepEqual(parse('attachment; filename="ä-%41.html"'), {
          type: 'attachment',
          parameters: { filename: 'ä-%41.html' }
        })
      })

      it('should parse "attachment; filename="foo-%c3%a4-%e2%82%ac.html""', () => {
        assert.deepEqual(parse('attachment; filename="foo-%c3%a4-%e2%82%ac.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo-%c3%a4-%e2%82%ac.html' }
        })
      })

      it('should parse "attachment; filename ="foo.html""', () => {
        assert.deepEqual(parse('attachment; filename ="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should keep the first duplicate quoted filename', () => {
        assert.deepEqual(parse('attachment; filename="foo.html"; filename="bar.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should preserve bracket characters in token values', () => {
        assert.deepEqual(parse('attachment; filename=foo[1](2).html'), {
          type: 'attachment',
          parameters: { filename: 'foo[1](2).html' }
        })
      })

      it('should preserve latin1 token values', () => {
        assert.deepEqual(parse('attachment; filename=foo-ä.html'), {
          type: 'attachment',
          parameters: { filename: 'foo-ä.html' }
        })
      })

      it('should preserve mojibake token values', () => {
        assert.deepEqual(parse('attachment; filename=foo-Ã¤.html'), {
          type: 'attachment',
          parameters: { filename: 'foo-Ã¤.html' }
        })
      })

      it('should treat a bare parameter as the type', () => {
        assert.deepEqual(parse('filename=foo.html'), {
          type: 'filename=foo.html',
          parameters: {}
        })
      })

      it('should preserve invalid type token with parameters', () => {
        assert.deepEqual(parse('x=y; filename=foo.html'), {
          type: 'x=y',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should stop at the first recoverable parameter after a quoted type', () => {
        assert.deepEqual(parse('"foo; filename=bar;baz"; filename=qux'), {
          type: '"foo',
          parameters: { filename: 'bar' }
        })
      })

      it('should preserve commas in a malformed type token', () => {
        assert.deepEqual(parse('filename=foo.html, filename=bar.html'), {
          type: 'filename=foo.html, filename=bar.html',
          parameters: {}
        })
      })

      it('should allow an empty type when parameters follow', () => {
        assert.deepEqual(parse('; filename=foo.html'), {
          type: '',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should preserve leading punctuation in the type', () => {
        assert.deepEqual(parse(': inline; attachment; filename=foo.html'), {
          type: ': inline',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should skip bare parameters without values', () => {
        assert.deepEqual(parse('inline; attachment; filename=foo.html'), {
          type: 'inline',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should skip bare attachment parameters without values', () => {
        assert.deepEqual(parse('attachment; inline; filename=foo.html'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should ignore a suffix after a quoted filename', () => {
        assert.deepEqual(parse('attachment; filename="foo.html".txt'), {
          type: 'attachment',
          parameters: { filename: 'foo.html' }
        })
      })

      it('should treat an unterminated quoted as omitted', () => {
        assert.deepEqual(parse('attachment; filename="bar'), {
          type: 'attachment',
          parameters: {}
        })
      })

      it('should stop a token value at the next semicolon', () => {
        assert.deepEqual(parse('attachment; filename=foo"bar;baz"qux'), {
          type: 'attachment',
          parameters: { filename: 'foo"bar' }
        })
      })

      it('should preserve a comma-separated header fragment in the first value', () => {
        assert.deepEqual(parse('attachment; filename=foo.html, attachment; filename=bar.html'), {
          type: 'attachment',
          parameters: { filename: 'foo.html, attachment' }
        })
      })

      it('should keep an unseparated parameter assignment inside the value', () => {
        assert.deepEqual(parse('attachment; foo=foo filename=bar'), {
          type: 'attachment',
          parameters: { foo: 'foo filename=bar' }
        })
      })

      it('should keep trailing assignments inside the filename value', () => {
        assert.deepEqual(parse('attachment; filename=bar foo=foo'), {
          type: 'attachment',
          parameters: { filename: 'bar foo=foo' }
        })
      })

      it('should treat missing semicolon after the type as part of the type', () => {
        assert.deepEqual(parse('attachment filename=bar'), {
          type: 'attachment filename=bar',
          parameters: {}
        })
      })

      it('should keep the first malformed type segment', () => {
        assert.deepEqual(parse('filename=foo.html; attachment'), {
          type: 'filename=foo.html',
          parameters: {}
        })
      })

      it('should parse "attachment; xfilename=foo.html"', () => {
        assert.deepEqual(parse('attachment; xfilename=foo.html'), {
          type: 'attachment',
          parameters: { xfilename: 'foo.html' }
        })
      })

      it('should parse "attachment; filename="/foo.html""', () => {
        assert.deepEqual(parse('attachment; filename="/foo.html"'), {
          type: 'attachment',
          parameters: { filename: '/foo.html' }
        })
      })

      it('should parse "attachment; filename="\\\\foo.html""', () => {
        assert.deepEqual(parse('attachment; filename="\\\\foo.html"'), {
          type: 'attachment',
          parameters: { filename: '\\foo.html' }
        })
      })
    })

    describe('Additional Parameters', () => {
      it('should parse "attachment; creation-date="Wed, 12 Feb 1997 16:29:51 -0500""', () => {
        assert.deepEqual(parse('attachment; creation-date="Wed, 12 Feb 1997 16:29:51 -0500"'), {
          type: 'attachment',
          parameters: { 'creation-date': 'Wed, 12 Feb 1997 16:29:51 -0500' }
        })
      })

      it('should parse "attachment; modification-date="Wed, 12 Feb 1997 16:29:51 -0500""', () => {
        assert.deepEqual(parse('attachment; modification-date="Wed, 12 Feb 1997 16:29:51 -0500"'), {
          type: 'attachment',
          parameters: {
            'modification-date': 'Wed, 12 Feb 1997 16:29:51 -0500'
          }
        })
      })
    })

    describe('Disposition-Type Extension', () => {
      it('should parse "foobar"', () => {
        assert.deepEqual(parse('foobar'), {
          type: 'foobar',
          parameters: {}
        })
      })

      it('should parse "attachment; example="filename=example.txt""', () => {
        assert.deepEqual(parse('attachment; example="filename=example.txt"'), {
          type: 'attachment',
          parameters: { example: 'filename=example.txt' }
        })
      })
    })

    describe('RFC 8187 Encoding: Character Sets', () => {
      it('should parse "attachment; filename*=iso-8859-1\'\'foo-%E4.html"', () => {
        assert.deepEqual(parse("attachment; filename*=iso-8859-1''foo-%E4.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-ä.html'
          }
        })
      })

      it('should parse "attachment; filename*=UTF-8\'\'foo-%c3%a4-%e2%82%ac.html"', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''foo-%c3%a4-%e2%82%ac.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-ä-€.html'
          }
        })
      })

      it('should preserve extended values without a charset', () => {
        assert.deepEqual(parse("attachment; filename*=''foo-%c3%a4-%e2%82%ac.html"), {
          type: 'attachment',
          parameters: { 'filename*': "''foo-%c3%a4-%e2%82%ac.html" }
        })
      })

      it('should parse "attachment; filename*=UTF-8\'\'foo-a%cc%88.html"', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''foo-a%cc%88.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-ä.html'
          }
        })
      })

      it('should parse iso-8859-1 extended parameter value with invalid bytes', () => {
        assert.deepEqual(parse("attachment; filename*=iso-8859-1''foo-%c3%a4-%e2%82%ac.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-Ã¤-â\x82¬.html'
          }
        })
      })

      it('should preserve spaces before the star in the parameter name', () => {
        assert.deepEqual(parse("attachment; filename *=UTF-8''foo-%c3%a4.html"), {
          type: 'attachment',
          parameters: {
            'filename ': 'foo-ä.html'
          }
        })
      })

      it('should parse "attachment; filename*= UTF-8\'\'foo-%c3%a4.html"', () => {
        assert.deepEqual(parse("attachment; filename*= UTF-8''foo-%c3%a4.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-ä.html'
          }
        })
      })

      it('should parse "attachment; filename* =UTF-8\'\'foo-%c3%a4.html"', () => {
        assert.deepEqual(parse("attachment; filename* =UTF-8''foo-%c3%a4.html"), {
          type: 'attachment',
          parameters: {
            filename: 'foo-ä.html'
          }
        })
      })

      it('should preserve quoted UTF-8 extended values verbatim', () => {
        assert.deepEqual(parse('attachment; filename*="UTF-8\'\'foo-%c3%a4.html"'), {
          type: 'attachment',
          parameters: { 'filename*': "UTF-8''foo-%c3%a4.html" }
        })
      })

      it('should preserve quoted extended values without charset verbatim', () => {
        assert.deepEqual(parse('attachment; filename*="foo%20bar.html"'), {
          type: 'attachment',
          parameters: { 'filename*': 'foo%20bar.html' }
        })
      })

      it('should preserve extended values without both apostrophes', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8'foo-%c3%a4.html"), {
          type: 'attachment',
          parameters: { 'filename*': "UTF-8'foo-%c3%a4.html" }
        })
      })

      it('should ignore malformed trailing percent escapes', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''foo%"), {
          type: 'attachment',
          parameters: { 'filename*': "UTF-8''foo%" }
        })
      })

      it('should ignore malformed percent escapes inside the value', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''f%oo.html"), {
          type: 'attachment',
          parameters: { 'filename*': "UTF-8''f%oo.html" }
        })
      })

      it('should parse "attachment; filename*=UTF-8\'\'A-%2541.html"', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''A-%2541.html"), {
          type: 'attachment',
          parameters: {
            filename: 'A-%41.html'
          }
        })
      })

      it('should parse "attachment; filename*=UTF-8\'\'%5cfoo.html"', () => {
        assert.deepEqual(parse("attachment; filename*=UTF-8''%5cfoo.html"), {
          type: 'attachment',
          parameters: {
            filename: '\\foo.html'
          }
        })
      })
    })

    describe('RFC2231 Encoding: Continuations', () => {
      it('should parse "attachment; filename*0="foo."; filename*1="html""', () => {
        assert.deepEqual(parse('attachment; filename*0="foo."; filename*1="html"'), {
          type: 'attachment',
          parameters: { 'filename*0': 'foo.', 'filename*1': 'html' }
        })
      })

      it('should parse "attachment; filename*0="foo"; filename*1="\\b\\a\\r.html""', () => {
        assert.deepEqual(parse('attachment; filename*0="foo"; filename*1="\\b\\a\\r.html"'), {
          type: 'attachment',
          parameters: { 'filename*0': 'foo', 'filename*1': 'bar.html' }
        })
      })

      it('should parse "attachment; filename*0*=UTF-8\'\'foo-%c3%a4; filename*1=".html""', () => {
        assert.deepEqual(parse('attachment; filename*0*=UTF-8\'\'foo-%c3%a4; filename*1=".html"'), {
          type: 'attachment',
          parameters: {
            'filename*0': 'foo-ä',
            'filename*1': '.html'
          }
        })
      })

      it('should parse "attachment; filename*0="foo"; filename*01="bar""', () => {
        assert.deepEqual(parse('attachment; filename*0="foo"; filename*01="bar"'), {
          type: 'attachment',
          parameters: { 'filename*0': 'foo', 'filename*01': 'bar' }
        })
      })

      it('should parse "attachment; filename*0="foo"; filename*2="bar""', () => {
        assert.deepEqual(parse('attachment; filename*0="foo"; filename*2="bar"'), {
          type: 'attachment',
          parameters: { 'filename*0': 'foo', 'filename*2': 'bar' }
        })
      })

      it('should parse "attachment; filename*1="foo."; filename*2="html""', () => {
        assert.deepEqual(parse('attachment; filename*1="foo."; filename*2="html"'), {
          type: 'attachment',
          parameters: { 'filename*1': 'foo.', 'filename*2': 'html' }
        })
      })

      it('should parse "attachment; filename*1="bar"; filename*0="foo""', () => {
        assert.deepEqual(parse('attachment; filename*1="bar"; filename*0="foo"'), {
          type: 'attachment',
          parameters: { 'filename*1': 'bar', 'filename*0': 'foo' }
        })
      })
    })

    describe('RFC2231 Encoding: Fallback Behaviour', () => {
      it("should parse \"attachment; filename*0*=ISO-8859-15''euro-sign%3d%a4; filename*=ISO-8859-1''currency-sign%3d%a4", () => {
        assert.deepEqual(
          parse("attachment; filename*0*=ISO-8859-15''euro-sign%3d%a4; filename*=ISO-8859-1''currency-sign%3d%a4"),
          {
            type: 'attachment',
            parameters: {
              filename: 'currency-sign=¤',
              'filename*0*': "ISO-8859-15''euro-sign%3d%a4"
            }
          }
        )
      })

      it('should parse "attachment; foobar=x; filename="foo.html"', () => {
        assert.deepEqual(parse('attachment; foobar=x; filename="foo.html"'), {
          type: 'attachment',
          parameters: { filename: 'foo.html', foobar: 'x' }
        })
      })
    })

    describe('RFC2047 Encoding', () => {
      it('should preserve RFC2047-looking token values', () => {
        assert.deepEqual(parse('attachment; filename==?ISO-8859-1?Q?foo-=E4.html?='), {
          type: 'attachment',
          parameters: { filename: '=?ISO-8859-1?Q?foo-=E4.html?=' }
        })
      })

      it('should parse "attachment; filename="=?ISO-8859-1?Q?foo-=E4.html?=""', () => {
        assert.deepEqual(parse('attachment; filename="=?ISO-8859-1?Q?foo-=E4.html?="'), {
          type: 'attachment',
          parameters: { filename: '=?ISO-8859-1?Q?foo-=E4.html?=' }
        })
      })
    })
  })
})

describe('parse(string, options)', () => {
  describe('with "multipart" option', () => {
    it('should ignore unterminated values ending in percent escapes', () => {
      for (const suffix of ['%', '%0']) {
        assert.deepEqual(
          parse('form-data; name="upload"; filename="plans' + suffix, {
            multipart: true
          }),
          { type: 'form-data', parameters: { name: 'upload' } }
        )
      }
    })

    it('should preserve invalid escapes alongside decoded escapes', () => {
      assert.deepEqual(
        parse('form-data; filename="%22plans%00%20%2%"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { filename: '"plans%00%20%2%' }
        }
      )
    })

    it('should parse browser multipart field names and filenames', () => {
      assert.deepEqual(
        parse('form-data; name="upload"; filename="the %22plans%22.pdf"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'upload', filename: 'the "plans".pdf' }
        }
      )
    })

    it('should decode new line characters', () => {
      assert.deepEqual(
        parse('form-data; name="upload"; filename="foo%0abar%0d.txt"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'upload', filename: 'foo\nbar\r.txt' }
        }
      )
    })

    it('should decode uppercase line feed escapes', () => {
      assert.deepEqual(
        parse('form-data; name="upload"; filename="foo%0Abar%0D.txt"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'upload', filename: 'foo\nbar\r.txt' }
        }
      )
    })

    it('should handle incomplete percent escapes', () => {
      assert.deepEqual(
        parse('form-data; name="upload"; filename="foo%2"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'upload', filename: 'foo%2' }
        }
      )
    })

    it('should preserve Unicode values', () => {
      assert.deepEqual(
        parse('form-data; name="upload"; filename="€ rates.pdf"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'upload', filename: '€ rates.pdf' }
        }
      )
    })

    it('should not decode other percent escapes', () => {
      assert.deepEqual(
        parse('form-data; name="foo%20bar"; filename="foo%41bar.txt"', {
          multipart: true
        }),
        {
          type: 'form-data',
          parameters: { name: 'foo%20bar', filename: 'foo%41bar.txt' }
        }
      )
    })

    it('should roundtrip percent escapes', () => {
      assert.deepEqual(
        parse(
          format({
            type: 'form-data',
            parameters: { name: 'foo\nbar', filename: '"foo\rbar".txt' }
          }),
          {
            multipart: true
          }
        ),
        {
          type: 'form-data',
          parameters: {
            name: 'foo\nbar',
            filename: '"foo\rbar".txt'
          }
        }
      )
    })
  })
})
