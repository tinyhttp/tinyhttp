import { IncomingMessage as Request, ServerResponse as Response } from 'node:http'
import { Options, Ranges, Result, parseRange } from 'header-range-parser'
import { fresh } from 'es-fresh'
import { typeIs } from '@tinyhttp/type-is'

export * from './accepts.js'

export * from '@tinyhttp/url'

export const getRequestHeader =
  (req: Pick<Request, 'headers'>) =>
  (header: string): string | string[] => {
    const lc = header.toLowerCase()

    switch (lc) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer
      default:
        return req.headers[lc]
    }
  }

export const getRangeFromHeader =
  (req: Pick<Request, 'headers'>) =>
  (size: number, options?: Options): Result | Ranges => {
    const range = getRequestHeader(req)('Range') as string

    if (!range) return

    return parseRange(size, range, options)
  }

export const getFreshOrStale = (
  req: Pick<Request, 'headers' | 'method'>,
  res: Pick<Response, 'getHeader' | 'statusCode'>
): boolean => {
  const method = req.method
  const status = res.statusCode

  // GET or HEAD for weak freshness validation only
  if (method !== 'GET' && method !== 'HEAD') return false

  // 2xx or 304 as per rfc2616 14.26
  if ((status >= 200 && status < 300) || status === 304) {
    return fresh(req.headers, {
      etag: res.getHeader('ETag'),
      'last-modified': res.getHeader('Last-Modified')
    })
  }

  return false
}

export const checkIfXMLHttpRequest = (req: Pick<Request, 'headers'>): boolean =>
  req.headers['x-requested-with'] === 'XMLHttpRequest'

export const reqIs =
  (req: Pick<Request, 'headers'>) =>
  (...types: string[]): boolean =>
    typeIs(req.headers['content-type'], ...types)
