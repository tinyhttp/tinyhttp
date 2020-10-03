const pairSplitRegExp = /; */

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

function tryDecode(str: string, decode: (str: string) => any) {
  try {
    return decode(str)
  } catch (e) {
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
    decode: (str: string) => any
  } = {
    decode: decodeURIComponent,
  }
) {
  const obj = {}
  const pairs = str.split(pairSplitRegExp)

  for (const pair of pairs) {
    let eqIdx = pair.indexOf('=')

    // skip things that don't look like key=value
    if (eqIdx < 0) {
      continue
    }

    const key = pair.substr(0, eqIdx).trim()
    let val = pair.substr(++eqIdx, pair.length).trim()

    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1)

    // only assign once
    if (obj[key] == null) obj[key] = tryDecode(val, options.decode)
  }

  return obj
}

export type SerializeOptions = Partial<{
  encode: (str: string) => string
  maxAge: number
  domain: string
  path: string
  httpOnly: boolean
  secure: boolean
  sameSite: boolean | 'Strict' | 'strict' | 'Lax' | 'lax' | 'None' | 'none' | string
  expires: Date
}>

export function serialize(name: string, val: string, opt: SerializeOptions = {}) {
  if (!opt.encode) opt.encode = encodeURIComponent

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid')
  }

  const value = opt.encode(val)

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid')
  }

  let str = name + '=' + value

  if (null != opt.maxAge) {
    const maxAge = opt.maxAge - 0

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError('option maxAge is invalid')
    }

    str += '; Max-Age=' + Math.floor(maxAge)
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid')
    }

    str += '; Domain=' + opt.domain
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid')
    }

    str += '; Path=' + opt.path
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid')
    }

    str += '; Expires=' + opt.expires.toUTCString()
  }

  if (opt.httpOnly) {
    str += '; HttpOnly'
  }

  if (opt.secure) {
    str += '; Secure'
  }

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
