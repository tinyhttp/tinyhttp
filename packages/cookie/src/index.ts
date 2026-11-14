const pairSplitRegExp = /; */

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

// biome-ignore lint/suspicious/noControlCharactersInRegex: RFC 7230 field-content includes HTAB
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

function tryDecode(str: string, decode: (str: string) => string) {
  try {
    return decode(str)
  } catch (_e) {
    return str
  }
}

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 */
export function parse(
  str: string,
  options: {
    decode: (str: string) => string
  } = {
    decode: decodeURIComponent
  }
): Record<string, string> {
  const obj: Record<string, string> = {}
  const pairs = str.split(pairSplitRegExp)

  for (const pair of pairs) {
    let eqIdx = pair.indexOf('=')

    // skip things that don't look like key=value
    if (eqIdx < 0) continue

    const key = pair.slice(0, eqIdx).trim()
    let val = pair.slice(++eqIdx, pair.length).trim()

    // quoted values
    if ('"' === val[0]) val = val.slice(1, -1)

    // only assign once
    if (obj[key] == null) obj[key] = tryDecode(val, options.decode)
  }

  return obj
}

/**
 * Options for the {@link serialize} function.
 */
export type SerializeOptions = Partial<{
  /**
   * A function to encode the cookie value.
   * Defaults to `encodeURIComponent`.
   */
  encode: (str: string) => string

  /**
   * Specifies the `Max-Age` attribute in seconds.
   * A zero or negative number will expire the cookie immediately.
   * If both `expires` and `maxAge` are set, `maxAge` takes precedence.
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.2
   */
  maxAge: number

  /**
   * Specifies the `Domain` attribute.
   * By default, no domain is set, and most clients will consider
   * the cookie to apply to only the current domain.
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.3
   */
  domain: string

  /**
   * Specifies the `Path` attribute.
   * By default, the path is considered the "default path".
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.4
   */
  path: string

  /**
   * Specifies the `HttpOnly` attribute.
   * When truthy, the `HttpOnly` attribute is set; otherwise it is not.
   * Mitigates the risk of client-side script accessing the protected cookie.
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.6
   */
  httpOnly: boolean

  /**
   * Specifies the `Secure` attribute.
   * When truthy, the `Secure` attribute is set; otherwise it is not.
   * The cookie will only be sent over HTTPS.
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.5
   */
  secure: boolean

  /**
   * Specifies the `SameSite` attribute.
   * - `true` or `'Strict'`: strictly same site
   * - `'Lax'`: lax same site (sent with top-level navigations)
   * - `'None'`: no same-site restriction (requires `Secure`)
   *
   * @see https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7
   */
  sameSite: boolean | 'Strict' | 'strict' | 'Lax' | 'lax' | 'None' | 'none' | string

  /**
   * Specifies the `Expires` attribute as a `Date` object.
   * If not set, the cookie will be treated as a session cookie and
   * removed when the browser is closed.
   *
   * @see https://tools.ietf.org/html/rfc6265#section-5.2.1
   */
  expires: Date
}>

/**
 * Serialize a cookie name-value pair into a `Set-Cookie` header string.
 *
 * @param name - The name of the cookie. Must only contain valid US-ASCII characters.
 * @param val - The value of the cookie.
 * @param opt - Optional serialization options (encoding, flags, expiry, etc.).
 * @returns A string suitable for use as the value of a `Set-Cookie` HTTP header.
 * @throws {TypeError} If the cookie name or value contains invalid characters,
 *   or if any of the provided options are invalid.
 *
 * @example
 * ```ts
 * import { serialize } from '@tinyhttp/cookie'
 *
 * const header = serialize('session', 'abc123', {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'Lax',
 *   maxAge: 3600
 * })
 * // => 'session=abc123; Max-Age=3600; HttpOnly; Secure; SameSite=Lax'
 * ```
 */
export function serialize(name: string, val: string, opt: SerializeOptions = {}): string {
  if (!opt.encode) opt.encode = encodeURIComponent

  if (!fieldContentRegExp.test(name)) throw new TypeError('argument name is invalid')

  const value = opt.encode(val)

  if (value && !fieldContentRegExp.test(value)) throw new TypeError('argument val is invalid')

  let str = `${name}=${value}`

  if (null != opt.maxAge) {
    const maxAge = opt.maxAge - 0

    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) throw new TypeError('option maxAge is invalid')

    str += `; Max-Age=${Math.floor(maxAge)}`
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) throw new TypeError('option domain is invalid')

    str += `; Domain=${opt.domain}`
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) throw new TypeError('option path is invalid')

    str += `; Path=${opt.path}`
  }

  if (opt.expires) str += `; Expires=${opt.expires.toUTCString()}`

  if (opt.httpOnly) str += '; HttpOnly'

  if (opt.secure) str += '; Secure'

  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite

    switch (sameSite) {
      case true:
      case 'strict':
        str += '; SameSite=Strict'
        break
      case 'lax':
        str += '; SameSite=Lax'
        break
      case 'none':
        str += '; SameSite=None'
        break
      default:
        throw new TypeError('option sameSite is invalid')
    }
  }

  return str
}
