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
    }
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
  it('should do escaping', () => {
    expect(cookie.serialize('cat', '+ ')).toBe('cat=%2B%20')
  })
})
