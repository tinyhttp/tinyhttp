import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Compute the unpadded base64 HMAC of `val` with `secret`.
 */
const hmac = (val: string, secret: string): string =>
  createHmac('sha256', secret).update(val).digest('base64').replace(/=+$/, '')

/**
 * Sign the given `val` with `secret`.
 */
export const sign = (val: string, secret: string): string => `${val}.${hmac(val, secret)}`

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 */
export const unsign = (val: string, secret: string): string | false => {
  const index = val.lastIndexOf('.')
  if (index === -1) return false

  const str = val.slice(0, index)

  // Compare the signature alone. `str` is sliced out of `val`, so comparing the
  // whole strings would compare `str` against itself; only the signature is
  // untrusted. The expected side is always 43 bytes, and a signature of any
  // other length is rejected outright rather than truncated to fit, which is
  // what let `${valid}tampered` verify successfully (GHSA-63x4-8g8c-vhww).
  const expected = Buffer.from(hmac(str, secret))
  const actual = Buffer.from(val.slice(index + 1))

  if (expected.length !== actual.length) return false

  return timingSafeEqual(expected, actual) ? str : false
}
