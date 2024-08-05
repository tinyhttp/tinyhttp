import type { IncomingMessage } from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'

import { type Trust, all, compile, proxyaddr as proxyAddr } from '@tinyhttp/proxy-addr'
import type { Options, Ranges } from 'header-range-parser'

import type { Middleware } from '@tinyhttp/router'
import type { App } from './app.js'

import { isIP } from 'node:net'
import type { Socket } from 'node:net'
import type { TLSSocket } from 'node:tls'
import type { URLParams } from '@tinyhttp/req'

export { getURLParams } from '@tinyhttp/req'

const trustRemoteAddress = ({ socket }: Pick<Request, 'headers' | 'socket'>, trust: Trust): boolean => {
  const val = socket.remoteAddress
  if (typeof trust !== 'function') trust = compile(trust)
  return trust(val, 0)
}

export const getProtocol = (req: Request, trust: Trust): Protocol => {
  const proto = `http${req.secure ? 's' : ''}`

  if (!trustRemoteAddress(req, trust)) return proto

  const header = (req.get('X-Forwarded-Proto') as string) || proto

  const index = header.indexOf(',')

  return index !== -1 ? header.substring(0, index).trim() : header.trim()
}

export const getHostname = (req: Request, trust: Trust): string | undefined => {
  let host: string = req.get('X-Forwarded-Host') as string

  if (!host || !trustRemoteAddress(req, trust)) host = req.get('Host') as string

  if (!host) return

  // IPv6 literal support
  const index = host.indexOf(':', host[0] === '[' ? host.indexOf(']') + 1 : 0)

  return index !== -1 ? host.substring(0, index) : host
}

export const getIP = (req: Pick<Request, 'headers' | 'connection' | 'socket'>, trust: Trust): string | undefined =>
  proxyAddr(req, trust).replace(/^.*:/, '') // striping the redundant prefix addeded by OS to IPv4 address

export const getIPs = (req: Pick<Request, 'headers' | 'connection' | 'socket'>, trust: Trust): string[] | undefined =>
  all(req, trust)

export const getSubdomains = (req: Request, trust: Trust, subdomainOffset = 2): string[] => {
  const hostname = getHostname(req, trust)

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
