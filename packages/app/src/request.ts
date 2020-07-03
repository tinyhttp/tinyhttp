import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'
import rg from 'regexparam'
import { parse } from 'url'
import parseRange, { Ranges, Options } from 'range-parser'
import proxyAddr from 'proxy-addr'
import { App, Middleware } from './app'
import { Handler } from './router'
// import { Response } from './response'
import { compileTrust, rgExec } from './utils/request'

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
  return app.middleware.find(h => h.handler.name === handler.name)
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

export const getRequestHeader = (req: Request) => (header: string) => {
  return req.headers[header]
}

export const setRequestHeader = (req: Request) => (field: string, value: string) => {
  return (req.headers[field] = value)
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
  var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0
  var index = host.indexOf(':', offset)

  return index !== -1 ? host.substring(0, index) : host
}

export const getIP = (req: Request) => {
  return proxyAddr(req, compileTrust)
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

// export const getFreshOrStale = (req: Request, res: Response) => {
//   const method = req.method
//   const status = res.statusCode

//   // GET or HEAD for weak freshness validation only
//   if ('GET' !== method && 'HEAD' !== method) return false

//   // 2xx or 304 as per rfc2616 14.26
//   if ((status >= 200 && status < 300) || 304 === status) {
//     return fresh(this.headers, {
//       etag: res.get('ETag'),
//       'last-modified': res.get('Last-Modified')
//     })
//   }

//   return false
// }

export type Connection = IncomingMessage['socket'] & {
  encrypted: boolean
}

export type Protocol = 'http' | 'https' | string

export interface Request extends IncomingMessage {
  app: App

  query: ParsedUrlQuery
  params: URLParams
  connection: Connection

  route?: Middleware | undefined

  protocol: Protocol
  secure: boolean

  xhr: boolean
  hostname: string | undefined

  get: (header: string) => string | string[] | undefined
  set: (field: string, value: string) => string
  range: (size: number, options?: any) => -1 | -2 | Ranges | undefined

  cookies?: any
  signedCookies?: any
  secret?: string | string[]
}
