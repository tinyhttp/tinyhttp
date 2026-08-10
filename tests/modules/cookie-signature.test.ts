import { describe, expect, it } from 'vitest'
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

  it('should unsign a value containing dots', () => {
    const val = cookie.sign('a.b.c', 'tobiiscool')
    expect(cookie.unsign(val, 'tobiiscool')).toBe('a.b.c')
  })

  // GHSA-63x4-8g8c-vhww: the untrusted value was truncated to the length of the
  // expected signature before comparison, so any suffix appended to a valid
  // cookie was silently discarded and verified successfully.
  it('should reject a valid cookie with appended data', () => {
    const val = cookie.sign('mysessionid', 'secret')
    expect(cookie.unsign(`${val}tampered`, 'secret')).toBe(false)
  })

  it('should reject a truncated signature', () => {
    const val = cookie.sign('hello', 'tobiiscool')
    expect(cookie.unsign(val.slice(0, -1), 'tobiiscool')).toBe(false)
  })

  it('should reject a value with no signature separator', () => {
    expect(cookie.unsign('hello', 'tobiiscool')).toBe(false)
    expect(cookie.unsign('', 'tobiiscool')).toBe(false)
  })
})
