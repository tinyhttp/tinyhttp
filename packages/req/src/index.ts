import { IncomingMessage as Request, ServerResponse as Response } from 'http'
import parseRange, { Options } from 'range-parser'
import fresh from 'es-fresh'
import { typeIs } from '@tinyhttp/type-is'

export * from './accepts'

export * from '@tinyhttp/url'

export const getRequestHeader = (req: Request) => (header: string): string | string[] => {
  const lc = header.toLowerCase()

  switch (lc) {
    case 'referer':
    case 'referrer':
      return req.headers.referrer || req.headers.referer
    default:
      return req.headers[lc]
  }
}

export const getRangeFromHeader = (req: Request) => (size: number, options?: Options) => {
  const range = getRequestHeader(req)('Range') as string

  if (!range) return

  return parseRange(size, range, options)
}

export const getFreshOrStale = (req: Request, res: Response) => {
  const method = req.method
  const status = res.statusCode

  // GET or HEAD for weak freshness validation only
  if (method !== 'GET' && method !== 'HEAD') return false

  // 2xx or 304 as per rfc2616 14.26
  if ((status >= 200 && status < 300) || status === 304) {
    const resHeaders = {
      etag: getRequestHeader(req)('ETag'),
      'last-modified': res.getHeader('Last-Modified'),
    }

    return fresh(req.headers, resHeaders)
  }

  return false
}

export const checkIfXMLHttpRequest = (req: Request): boolean => {
  return req.headers['X-Requested-With'] === 'XMLHttpRequest'
}

export const reqIs = (req: Request) => (...types: string[]): boolean => {
  return typeIs(req.headers['content-type'], ...types)
}
