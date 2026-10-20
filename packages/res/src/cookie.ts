import type { IncomingMessage as Req, ServerResponse as Res } from 'node:http'
import * as cookie from '@tinyhttp/cookie'
import { sign } from '@tinyhttp/cookie-signature'
import { append } from './append.js'

export const setCookie =
  <Request extends Req = Req, Response extends Res = Res>(
    req: Request & {
      secret?: string | string[]
    },
    res: Response
  ) =>
  (
    name: string,
    value: string | Record<string, unknown>,
    options: cookie.SerializeOptions &
      Partial<{
        signed: boolean
      }> = {}
  ): Response => {
    const secret = req.secret as string

    const signed = options.signed || false

    if (signed && !secret) throw new Error('cookieParser("secret") required for signed cookies')

    let val = typeof value === 'object' ? `j:${JSON.stringify(value)}` : String(value)

    if (signed) val = `s:${sign(val, secret)}`

    const opts = { ...options }

    if (opts.maxAge) {
      opts.expires = new Date(Date.now() + opts.maxAge)
      opts.maxAge /= 1000
    }

    if (opts.path == null) opts.path = '/'

    append(res)('Set-Cookie', `${cookie.serialize(name, String(val), opts)}`)

    return res
  }

export const clearCookie =
  <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) =>
  (name: string, options?: cookie.SerializeOptions): Response => {
    return setCookie(req, res)(name, '', Object.assign({}, { expires: new Date(1), path: '/' }, options))
  }
