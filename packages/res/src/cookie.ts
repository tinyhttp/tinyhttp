import { IncomingMessage as I, ServerResponse as S } from 'http'
import * as cookie from '@tinyhttp/cookie'
import { sign } from '@tinyhttp/cookie-signature'

export const setCookie = <Request extends I = I, Response extends S = S>(
  req: Request & {
    secret?: string | string[]
  },
  res: Response
) => (
  name: string,
  value: string | Record<string, unknown>,
  options: cookie.SerializeOptions &
    Partial<{
      signed: boolean
    }> = {}
): Response => {
  const secret = req.secret as string

  const signed = options.signed || false

  if (signed && !secret) {
    throw new Error('cookieParser("secret") required for signed cookies')
  }

  let val = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (signed) {
    val = 's:' + sign(val, secret)
  }

  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  if (options.path == null) {
    options.path = '/'
  }

  res.setHeader('Set-Cookie', cookie.serialize(name, String(val), options))

  return res
}

export const clearCookie = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (name: string, options?: cookie.SerializeOptions): Response => {
  const opts = Object.assign({}, { expires: new Date(1), path: '/' }, options)

  return setCookie(req, res)(name, '', opts)
}
