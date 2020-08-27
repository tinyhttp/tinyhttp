import { Request, Response, NextFunction } from '@tinyhttp/app'
import * as cookie from '@tinyhttp/cookie'
import * as signature from '@tinyhttp/cookie-signature'

/**
 * Parse JSON cookie string.
 */
export function JSONCookie(str?: string | unknown) {
  if (typeof str !== 'string' || str.substr(0, 2) !== 'j:') {
    return undefined
  }

  try {
    return JSON.parse(str.slice(2))
  } catch (err) {
    return undefined
  }
}

/**
 * Parse JSON cookies.
 */
function JSONCookies(obj: any) {
  const cookies = Object.keys(obj)

  for (const key of cookies) {
    const val = JSONCookie(obj[key])

    if (val) {
      obj[key] = val
    }
  }

  return obj
}

/**
 * Parse a signed cookie string, return the decoded value.
 */
export function signedCookie(str: string | unknown, secret: string | string[]) {
  if (typeof str !== 'string') {
    return undefined
  }

  if (str.substr(0, 2) !== 's:') {
    return str
  }

  const secrets = !secret || Array.isArray(secret) ? secret || [] : [secret]

  for (const secret of secrets) {
    const val = signature.unsign(str.slice(2), secret)

    if (val !== false) {
      return val
    }
  }

  return false
}

/**
 * Parse signed cookies, returning an object containing the decoded key/value
 * pairs, while removing the signed key from obj.
 */
export function signedCookies(obj: any, secret: string | string[]) {
  const cookies = Object.keys(obj)
  const ret = Object.create(null)

  for (const key of cookies) {
    const val = obj[key]
    const dec = signedCookie(val, secret)

    if (val !== dec) {
      ret[key] = dec
      delete obj[key]
    }
  }

  return ret
}

/**
 * Parse Cookie header and populate `req.cookies`
 * with an object keyed by the cookie names.
 */
export const cookieParser = (secret?: string | string[]) => {
  const secrets = !secret || Array.isArray(secret) ? secret || [] : [secret]

  return function cookieParser(req: Request, _res: Response, next?: NextFunction) {
    if (req.cookies) {
      return
    }

    const cookies = req.headers.cookie

    req.secret = secrets[0]
    req.cookies = Object.create(null)

    if (!cookies) {
      return
    }

    req.cookies = cookie.parse(cookies)

    // parse signed cookies
    if (secrets.length !== 0) {
      req.signedCookies = signedCookies(req.cookies, secrets)
      req.signedCookies = JSONCookies(req.signedCookies)
    }

    // parse JSON cookies
    req.cookies = JSONCookies(req.cookies)

    next?.()
  }
}
