import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'
import rg from 'regexparam'
import { parse } from 'url'
import parseRange, { Ranges, Options } from 'range-parser'
import proxyAddr from 'proxy-addr'
import Accepts from 'es-accepts'
import fresh from 'es-fresh'
import { App } from './app'
import type { Middleware, Handler } from './router'
import { compileTrust, rgExec } from './utils/request'
import type { Response } from './response'

export const getQueryParams = (url = '/'): ParsedUrlQuery => {
  return parse(url, true).query
}

export type URLParams = {
  [key: string]: string
}

export const getURLParams = (reqUrl = '/', url = '/'): URLParams => {
  return rgExec(reqUrl, rg(url))
}

export const getRouteFromApp = (app: App, handler: Handler) => {
  return app.middleware.find((h) => h.handler.name === handler.name)
}

export const getProtocol = (req: Request): Protocol => {
  const proto = req.connection.encrypted ? 'https' : 'http'

  if (!compileTrust(req.connection.remoteAddress)) {
    return proto
  }

  const header = (req.headers['X-Forwarded-Proto'] as string) || proto

  const index = header.indexOf(',')

  return index !== -1 ? header.substring(0, index).trim() : header.trim()
}

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

export const setRequestHeader = (req: Request) => (field: string, value: string) => {
  return (req.headers[field.toLowerCase()] = value)
}

export const getRangeFromHeader = (req: Request) => (size: number, options?: Options) => {
  const range = req.get('Range') as string

  if (!range) return

  return parseRange(size, range, options)
}

export const checkIfXMLHttpRequest = (req: Request): boolean => {
  if (req.headers['X-Requested-With'] === 'XMLHttpRequest') {
    return true
  } else {
    return false
  }
}

export const getHostname = (req: Request): string | undefined => {
  let host: string | undefined = req.get('X-Forwarded-Host') as string | undefined

  if (!host || !compileTrust(req.connection.remoteAddress)) {
    host = req.get('Host') as string | undefined
  }

  if (!host) return

  // IPv6 literal support
  const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0
  const index = host.indexOf(':', offset)

  return index !== -1 ? host.substring(0, index) : host
}

export const getIP = (req: Request): string | undefined => {
  const proxyFn = compileTrust(req.connection.remoteAddress)
  const ip: string = proxyAddr(req, proxyFn).replace(/^.*:/, '') // striping the redundant prefix addeded by OS to IPv4 address
  return ip
}

export const getIPs = (req: Request): string[] | undefined => {
  const proxyFn = compileTrust(req.connection.remoteAddress)
  const addrs: string[] = proxyAddr.all(req, proxyFn)
  return addrs
}

// export const getRequestIs = (types: string | string[], ...args: string[]) => (req: Request) => {
//   let arr = types

//   if (!Array.isArray(types)) {
//     arr = new Array(args.length)
//     for (let i = 0; i < arr.length; i++) {
//       arr[i] = args[i]
//     }
//   }
// }

export const getFreshOrStale = (req: Request, res: Response) => {
  const method = req.method
  const status = res.statusCode

  // GET or HEAD for weak freshness validation only
  if (method !== 'GET' && method !== 'HEAD') return false

  // 2xx or 304 as per rfc2616 14.26
  if ((status >= 200 && status < 300) || 304 === status) {
    const resHeaders = {
      etag: res.get('ETag'),
      'last-modified': res.get('Last-Modified'),
    }

    return fresh(req.headers, resHeaders)
  }

  return false
}

export const getAccepts = (req: Request) => (...types: string[]): string | false | string[] => {
  return new Accepts(req).types(types)
}

export type Connection = IncomingMessage['socket'] & {
  encrypted: boolean
}

export type Protocol = 'http' | 'https' | string

export interface Request extends IncomingMessage {
  query: ParsedUrlQuery
  params: URLParams
  connection: Connection

  route?: Middleware | undefined

  protocol: Protocol
  secure: boolean

  xhr: boolean
  hostname: string | undefined
  ip?: string
  ips?: string[]

  get: (header: string) => string | string[] | undefined
  set: (field: string, value: string) => string
  range: (size: number, options?: any) => -1 | -2 | Ranges | undefined
  accepts: (...types: string[]) => string | false | string[]

  cookies?: any
  signedCookies?: any
  secret?: string | string[]

  fresh?: boolean
  stale?: boolean

  body?: any
}
