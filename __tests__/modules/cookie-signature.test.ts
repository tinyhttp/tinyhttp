import * as cookie from '../../packages/cookie-signature/src'

describe('.sign(val, secret)', () => {
  it('should sign the cookie', () => {
    let val = cookie.sign('hello', 'tobiiscool')
    expect(val).toBe('hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI')

    val = cookie.sign('hello', 'luna')
    expect(val).not.toBe('hello.DGDUkGlIkCzPz+C0B064FNgHdEjox7ch8tOBGslZ5QI')
  })
})

describe('.unsign(val, secret)', () => {
  it('should unsign the cookie', () => {
    const val = cookie.sign('hello', 'tobiiscool')
    expect(cookie.unsign(val, 'tobiiscool')).toBe('hello')
    expect(cookie.unsign(val, 'luna')).toBe(false)
  })
})
