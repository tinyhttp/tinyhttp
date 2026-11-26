import { decodeExtended } from '@tinyhttp/content-disposition'
import { assert, describe, it } from 'vitest'

describe('decodeExtended', () => {
  it('should decode every Latin-1 byte in either hex case', () => {
    for (let byte = 0; byte < 256; byte++) {
      const hex = byte.toString(16).padStart(2, '0')
      for (const digits of [hex, hex.toUpperCase()]) {
        assert.strictEqual(
          decodeExtended("ISO-8859-1''before%" + digits + 'after'),
          'before' + String.fromCharCode(byte) + 'after'
        )
      }
    }
  })

  it('should reject invalid hex digits in either position', () => {
    for (let code = 0; code < 256; code++) {
      const char = String.fromCharCode(code)
      if (/^[0-9a-f]$/i.test(char)) continue
      for (const digits of [char + '0', '0' + char]) {
        assert.strictEqual(decodeExtended("ISO-8859-1''%" + digits), undefined)
      }
    }
    for (const suffix of ['%', '%0', '%Ā0', '%0Ā', '%😀']) {
      assert.strictEqual(decodeExtended("ISO-8859-1''%41" + suffix), undefined)
    }
  })

  it('should preserve literal spans between and after escapes', () => {
    assert.strictEqual(decodeExtended("ISO-8859-1''prefix%00%ff-middle-%a3-終"), 'prefix\x00ÿ-middle-£-終')
  })
})
