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
})
