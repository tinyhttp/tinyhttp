import type { IncomingHttpHeaders, IncomingMessage as Request, ServerResponse as Response } from 'node:http'
import { typeIs } from '@tinyhttp/type-is'
import { type Options, parseRange, type Ranges, type Result } from 'header-range-parser'
import { fresh } from './fresh.js'

export * from '@tinyhttp/url'
export * from './accepts.js'

export const getRequestHeader = (req: Pick<Request, 'headers'>) => {
  return <HeaderName extends string>(header: HeaderName): IncomingHttpHeaders[HeaderName] => {
    const lc = header.toLowerCase()

    switch (lc) {
      case 'referer':
      case 'referrer':
        return (req.headers.referrer || req.headers.referer) as string | string[]
      default:
        return req.headers[lc] as string
    }
  }
}

export const getRangeFromHeader =
  (req: Pick<Request, 'headers'>) =>
  (size: number, options?: Options): Result | Ranges | undefined => {
    const range = getRequestHeader(req)('range')

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
      etag: res.getHeader('ETag') as string,
      'last-modified': res.getHeader('Last-Modified') as string
    })
  }

  return false
}

export const checkIfXMLHttpRequest = (req: Pick<Request, 'headers'>): boolean =>
  req.headers['x-requested-with'] === 'XMLHttpRequest'

export const reqIs =
  (req: Pick<Request, 'headers'>) =>
  (...types: string[]) =>
    typeIs(req.headers['content-type'] as string, ...types)
