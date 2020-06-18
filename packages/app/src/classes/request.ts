import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'
import rg from 'regexparam'
import { parse } from 'url'
import proxyAddr from 'proxy-addr'
import parseRange, { Ranges, Options } from 'range-parser'
import { App, Handler, Middleware } from '../app'

export const getQueryParams = (url = '/'): ParsedUrlQuery => {
  return parse(url, true).query
}

export type URLParams = {
  [key: string]: string
}

const exec = (
  path: string,
  result: {
    pattern: RegExp
    keys: string[]
  }
) => {
  let i = 0,
    out = {}
  let matches = result.pattern.exec(path)
  while (i < result.keys.length) {
    out[result.keys[i]] = matches?.[++i] || null
  }
  return out
}

export const getURLParams = (reqUrl = '/', url = '/'): URLParams => {
  return exec(reqUrl, rg(url))
}

export const getRouteFromApp = (app: App, handler: Handler) => {
  return app.routes.find(h => h.handler.name === handler.name)
}

export const compileTrust = (val: any) => {
  if (typeof val === 'function') return val

  if (val === true) {
    // Support plain true/false
    return function () {
      return true
    }
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return (_: unknown, i: number) => {
      if (val) {
        return i < val
      }
    }
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    val = val.split(/ *, */)
  }

  return proxyAddr.compile(val || [])
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

export const getHeader = (req: Request) => (header: string) => {
  return req.headers[header.toLowerCase()]
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

  get: (header: string) => string | string[] | undefined
  range: (size: number, options?: any) => -1 | -2 | Ranges | undefined
}
