import * as cookie from '../../packages/cookie/src/index'

describe('Cookie parsing', () => {
  it('should parse basic cookies', () => {
    expect(cookie.parse('foo=bar')).toStrictEqual({
      foo: 'bar',
    })
  })
  it('should ignore spaces', () => {
    expect(cookie.parse('foo =  bar;')).toStrictEqual({
      foo: 'bar',
    })
  })
  it('should properly do escaping', () => {
    expect(cookie.parse('foo="bar=123456789&name=Magic+Mouse"')).toStrictEqual({
      foo: 'bar=123456789&name=Magic+Mouse',
    })
  })
  it('should ignore escaping error and return original value', () => {
    expect(cookie.parse('foo=%1;bar=bar')).toStrictEqual({ foo: '%1', bar: 'bar' })
  })
  it('should ignore non values', () => {
    expect(cookie.parse('foo=%1;bar=bar;HttpOnly;Secure')).toStrictEqual({ foo: '%1', bar: 'bar' })
  })
  it('should assign only once', () => {
    expect(cookie.parse('foo=%1;bar=bar;foo=boo')).toStrictEqual({ foo: '%1', bar: 'bar' })
  })
  it('should decode with a custom decoder', () => {
    expect(
      cookie.parse('foo=%1;bar=bar;foo=boo', {
        decode: (_val: string) => {
          return 'foobar'
        },
      })
    ).toStrictEqual({ foo: 'foobar', bar: 'foobar' })
  })
})

describe('Cookie serializing', () => {
  it('should serialize basic cookie', () => {
    expect(cookie.serialize('foo', 'bar')).toBe('foo=bar')
  })
  it('should "Path" in cookie', () => {
    expect(
      cookie.serialize('foo', 'bar', {
        path: '/',
      })
    ).toBe('foo=bar; Path=/')
  })
  it('should put "Secure" in cookie', () => {
    expect(
      cookie.serialize('foo', 'bar', {
        secure: true,
      })
    ).toBe('foo=bar; Secure')
    expect(
      cookie.serialize('foo', 'bar', {
        secure: false,
      })
    ).toBe('foo=bar')
  })
  it('should put "httpOnly" in cookie', () => {
    expect(
      cookie.serialize('foo', 'bar', {
        httpOnly: true,
      })
    ).toBe('foo=bar; HttpOnly')
  })
  it('should put valid "maxAge" in cookie', () => {
    expect(
      cookie.serialize('foo', 'bar', {
        maxAge: 1000,
      })
    ).toBe('foo=bar; Max-Age=1000')
  })
  it('should throw on infinite "maxAge" parameter', () => {
    try {
      cookie.serialize('foo', 'bar', {
        maxAge: Infinity,
      })
    } catch (e) {
      expect((e as TypeError).message).toBe('option maxAge is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should properly set "sameSite" parameter', () => {
    expect(
      cookie.serialize('foo', 'bar', {
        sameSite: true,
      })
    ).toBe('foo=bar; SameSite=Strict')
    expect(
      cookie.serialize('foo', 'bar', {
        sameSite: 'Lax',
      })
    ).toBe('foo=bar; SameSite=Lax')
    expect(
      cookie.serialize('foo', 'bar', {
        sameSite: 'None',
      })
    ).toBe('foo=bar; SameSite=None')
  })
  it('should throw on invalid "sameSite" option', () => {
    try {
      cookie.serialize('foo', 'bar', {
        sameSite: 'blah blah',
      })
    } catch (e) {
      expect((e as TypeError).message).toBe('option sameSite is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should do escaping', () => {
    expect(cookie.serialize('cat', '+ ')).toBe('cat=%2B%20')
  })
  it('should parse serialized cookies', () => {
    expect(cookie.parse(cookie.serialize('cat', 'foo=123&name=baz five'))).toStrictEqual({ cat: 'foo=123&name=baz five' })
  })
  it('should throw on invalid `expires` format', () => {
    try {
      cookie.serialize('foo', 'bar', {
        // @ts-ignore
        expires: 'foobar',
      })
    } catch (e) {
      expect((e as TypeError).message).toBe('option expires is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should throw an error if argument name is invalid', () => {
    try {
      cookie.serialize('➡️', 'bar')
    } catch (e) {
      expect((e as TypeError).message).toBe('argument name is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should throw an error if argument val is invalid', () => {
    try {
      const customEncode = {
        encode: (val: string) => {
          return val
        },
      }
      cookie.serialize('foo', '➡️', customEncode)
    } catch (e) {
      expect((e as TypeError).message).toBe('argument val is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should throw an error if opt.domain is invalid', () => {
    try {
      const customOpt = { domain: '➡️' }
      cookie.serialize('foo', 'bar', customOpt)
    } catch (e) {
      expect((e as TypeError).message).toBe('option domain is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should throw an error if opt.path is invalid', () => {
    try {
      const customOpt = { path: '➡️' }
      cookie.serialize('foo', 'bar', customOpt)
    } catch (e) {
      expect((e as TypeError).message).toBe('option path is invalid')
      return
    }
    throw new Error('Did not throw an error')
  })
  it('should serialize a string correctly', () => {
    try {
      const customOpt = { path: 'lorem', domain: 'ipsum', expires: new Date(), sameSite: 'strict' }
      cookie.serialize('foo', 'bar', customOpt)
    } catch (e) {
      expect(e).toBe(undefined)
      return
    }
  })
})
