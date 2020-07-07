const pairSplitRegExp = /; */

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

function tryDecode(str: string, decode: (str: string) => any = decodeURIComponent) {
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
    decode: decodeURIComponent
  }
) {
  let obj = {}
  const pairs = str.split(pairSplitRegExp)

  for (const pair of pairs) {
    let eq_idx = pair.indexOf('=')

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue
    }

    const key = pair.substr(0, eq_idx).trim()
    let val = pair.substr(++eq_idx, pair.length).trim()

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
  sameSite: boolean | string
  expires: Date
}>

export function serialize(
  name: string,
  val: string,
  { encode = encodeURIComponent, domain, secure, httpOnly, expires, path, ...opt }: SerializeOptions
) {
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid')
  }

  const value = encode(val)

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid')
  }

  var str = name + '=' + value

  if (null != opt.maxAge) {
    const maxAge = opt.maxAge - 0

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError('option maxAge is invalid')
    }

    str += '; Max-Age=' + Math.floor(maxAge)
  }

  if (domain) {
    if (!fieldContentRegExp.test(domain)) {
      throw new TypeError('option domain is invalid')
    }

    str += '; Domain=' + domain
  }

  if (path) {
    if (!fieldContentRegExp.test(path)) {
      throw new TypeError('option path is invalid')
    }

    str += '; Path=' + path
  }

  if (expires) {
    if (typeof expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid')
    }

    str += '; Expires=' + expires.toUTCString()
  }

  if (httpOnly) {
    str += '; HttpOnly'
  }

  if (secure) {
    str += '; Secure'
  }

  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict'
        break
      case 'lax':
        str += '; SameSite=Lax'
        break
      case 'strict':
        str += '; SameSite=Strict'
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
