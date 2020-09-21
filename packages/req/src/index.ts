import { IncomingMessage as Request, ServerResponse as Response } from 'http'
import parseRange, { Options } from 'range-parser'
import fresh from 'es-fresh'
import { Accepts } from '@tinyhttp/accepts'

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
  if ((status >= 200 && status < 300) || 304 === status) {
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

export const getAccepts = (req: Request) => (...types: string[]): string | false | string[] => {
  const accepts = new Accepts(req)

  return accepts.types(types)
}

export const getAcceptsEncodings = (req: Request) => (...encodings: string[]) => {
  const accepts = new Accepts(req)

  return accepts.encodings(encodings)
}

export const getAcceptsCharsets = (req: Request) => (...charsets: string[]) => {
  const accepts = new Accepts(req)

  return accepts.charsets(charsets)
}
