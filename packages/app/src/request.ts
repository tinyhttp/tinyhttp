import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'

import { Ranges } from 'range-parser'
import { proxyaddr as proxyAddr, all } from '@tinyhttp/proxy-addr'
import { App } from './app'
import type { Middleware, Handler } from '@tinyhttp/router'
import type { Response } from './response'
import { compileTrust } from './utils/request'

import type { URLParams } from '@tinyhttp/req'
import { isIP } from 'net'

export { getURLParams } from '@tinyhttp/req'

export const getRouteFromApp = (app: App, handler: Handler<Request, Response>) => {
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
  const addrs: string[] = all(req, proxyFn)
  return addrs
}

export const getSubdomains = (req: Request, subdomainOffset = 2): string[] => {
  const hostname = getHostname(req)

  if (!hostname) return []

  const offset = subdomainOffset

  const subdomains = isIP(hostname) ? [hostname] : hostname.split('.').reverse()

  return subdomains.slice(offset)
}

export type Connection = IncomingMessage['socket'] & {
  encrypted: boolean
}

export type Protocol = 'http' | 'https' | string

export type { URLParams }

type AcceptsReturns = string | false | string[]

export interface Request extends IncomingMessage {
  originalUrl: string
  path: string

  query: ParsedUrlQuery
  params?: URLParams
  connection: Connection

  route?: Middleware | undefined

  protocol: Protocol
  secure: boolean

  xhr: boolean
  hostname: string | undefined
  ip?: string
  ips?: string[]
  subdomains?: string[]

  get: (header: string) => string | string[] | undefined

  range: (size: number, options?: any) => -1 | -2 | Ranges | undefined
  accepts: (...types: string[]) => AcceptsReturns
  acceptsEncodings: (...encodings: string[]) => AcceptsReturns
  acceptsCharsets: (...charsets: string[]) => AcceptsReturns

  is: (...types: string[]) => boolean

  cookies?: any
  signedCookies?: any
  secret?: string | string[]

  fresh?: boolean
  stale?: boolean

  body?: any

  app?: App
}
