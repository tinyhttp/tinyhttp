import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'

import { Options, Ranges } from 'header-range-parser'
import { proxyaddr as proxyAddr, all, compile } from '@tinyhttp/proxy-addr'

import { App } from './app'
import type { Middleware, Handler } from '@tinyhttp/router'
import type { Response } from './response'

import type { URLParams } from '@tinyhttp/req'
import { isIP } from 'net'
import type { Socket } from 'net'
import type { TLSSocket } from 'tls'

export { getURLParams } from '@tinyhttp/req'

const trustRemoteAddress = ({ socket }: Pick<Request, 'headers' | 'connection' | 'socket'>) => {
  const val = socket.remoteAddress

  if (typeof val === 'function') return val

  if (typeof val === 'boolean' && val === true) return () => true

  if (typeof val === 'number') return (_: unknown, i: number) => (val ? i < val : undefined)

  if (typeof val === 'string') return compile(val.split(',').map((x) => x.trim()))

  return compile(val || [])
}

export const getRouteFromApp = ({ middleware }: App, h: Handler<Request, Response>): Middleware<Request, Response> =>
  middleware.find(({ handler }) => typeof handler === 'function' && handler.name === h.name)

export const getProtocol = (req: Request): Protocol => {
  const proto = req.connection.encrypted ? 'https' : 'http'

  if (!trustRemoteAddress(req)) return proto

  const header = (req.headers['X-Forwarded-Proto'] as string) || proto

  const index = header.indexOf(',')

  return index !== -1 ? header.substring(0, index).trim() : header.trim()
}

export const getHostname = (req: Request): string | undefined => {
  let host: string = req.get('X-Forwarded-Host') as string

  if (!host || !trustRemoteAddress(req)) host = req.get('Host') as string

  if (!host) return

  // IPv6 literal support
  const index = host.indexOf(':', host[0] === '[' ? host.indexOf(']') + 1 : 0)

  return index !== -1 ? host.substring(0, index) : host
}

export const getIP = (req: Pick<Request, 'headers' | 'connection' | 'socket'>): string | undefined =>
  proxyAddr(req, trustRemoteAddress(req)).replace(/^.*:/, '') // striping the redundant prefix addeded by OS to IPv4 address

export const getIPs = (req: Pick<Request, 'headers' | 'connection' | 'socket'>): string[] | undefined =>
  all(req, trustRemoteAddress(req))

export const getSubdomains = (req: Request, subdomainOffset = 2): string[] => {
  const hostname = getHostname(req)

  if (!hostname) return []

  const subdomains = isIP(hostname) ? [hostname] : hostname.split('.').reverse()

  return subdomains.slice(subdomainOffset)
}

export type Connection = IncomingMessage['socket'] & {
  encrypted: boolean
}

export type Protocol = 'http' | 'https' | string

export type { URLParams }

type AcceptsReturns = string | boolean | string[]

export interface Request extends IncomingMessage {
  originalUrl: string
  path: string
  url: string
  query: ParsedUrlQuery
  params: URLParams
  connection: Connection
  socket: TLSSocket | Socket
  route?: Middleware
  protocol: Protocol
  secure: boolean
  xhr: boolean
  hostname?: string
  ip?: string
  ips?: string[]
  subdomains?: string[]
  get: (header: string) => string | string[] | undefined
  range: (size: number, options?: Options) => -1 | -2 | -3 | Ranges | undefined
  accepts: (...types: string[]) => AcceptsReturns
  acceptsEncodings: (...encodings: string[]) => AcceptsReturns
  acceptsCharsets: (...charsets: string[]) => AcceptsReturns
  acceptsLanguages: (...languages: string[]) => AcceptsReturns
  is: (...types: string[]) => boolean
  cookies?: any
  signedCookies?: any
  secret?: string | string[]
  fresh?: boolean
  stale?: boolean
  body?: any
  app?: App
}
