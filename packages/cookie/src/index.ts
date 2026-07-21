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
 * Options for serializing a cookie.
 */
export type SerializeOptions = Partial<{
  /**
   * Specifies a function that will be used to encode a cookie's value.
   * Since value of a cookie has a limited character set (and must be a simple string),
   * this function can be used to encode a value into a string suited for a cookie's value.
   *
   * The default function is the global `encodeURIComponent`, which will encode a JavaScript string
   * into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.
   */
  encode: (str: string) => string
  /**
   * Specifies the number (in seconds) to be the value for the Max-Age Set-Cookie attribute.
   * The given number will be converted to an integer by rounding down.
   * By default, no maximum age is set.
   */
  maxAge: number
  /**
   * Specifies the value for the Domain Set-Cookie attribute.
   */
  domain: string
  /**
   * Specifies the value for the Path Set-Cookie attribute.
   * By default, the path is considered the "default path".
   */
  path: string
  /**
   * Specifies the boolean value for the HttpOnly Set-Cookie attribute.
   * When truthy, the HttpOnly attribute is set, otherwise it is not.
   * By default, the HttpOnly attribute is not set.
   */
  httpOnly: boolean
  /**
   * Specifies the boolean value for the Secure Set-Cookie attribute.
   * When truthy, the Secure attribute is set, otherwise it is not.
   * By default, the Secure attribute is not set.
   */
  secure: boolean
  /**
   * Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
   */
  sameSite: boolean | 'Strict' | 'strict' | 'Lax' | 'lax' | 'None' | 'none' | string
  /**
   * Specifies the `Date` object to be the value for the Expires Set-Cookie attribute.
   * By default, no expiration is set, and most clients will consider this a "non-persistent cookie"
   * and will delete it on a condition like exiting a web browser application.
   */
  expires: Date
}>

/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * @param name - cookie name
 * @param val - cookie value
 * @param opt - options
 * @returns serialized cookie string
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
