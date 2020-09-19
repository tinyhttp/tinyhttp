import { IncomingMessage as I, ServerResponse as S } from 'http'
import { getAccepts } from '@tinyhttp/req'
import { setVaryHeader } from './headers'
import { normalizeType, normalizeTypes } from './util'

export type next = (err?: any) => void

export type FormatProps = {
  default?: () => void
} & Record<string, any>

export const formatResponse = <Request extends I = I, Response extends S = S, Next extends next = next>(req: Request, res: Response, next: Next) => (obj: FormatProps) => {
  const fn = obj.default

  if (fn) delete obj.default

  const keys = Object.keys(obj)

  const key = keys.length > 0 ? (getAccepts(req)(...keys) as string) : false

  setVaryHeader(req, res)('Accept')

  if (key) {
    res.setHeader('Content-Type', normalizeType(key).value)
    obj[key](req, res, next)
  } else if (fn) {
    fn()
  } else {
    const err = new Error('Not Acceptable') as Error & {
      status: number
      statusCode: number
      types: any[]
    }
    err.status = err.statusCode = 406
    err.types = normalizeTypes(keys).map((o) => o.value)
    next(err)
  }

  return res
}
