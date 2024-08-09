import type { IncomingHttpHeaders, IncomingMessage } from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'

import { type Trust, all, compile, proxyaddr as proxyAddr } from '@tinyhttp/proxy-addr'
import type { Options, Ranges } from 'header-range-parser'

import type { Middleware } from '@tinyhttp/router'
import type { App } from './app.js'

import { isIP } from 'node:net'
import type { Socket } from 'node:net'
import type { TLSSocket } from 'node:tls'
import type { URLParams, getRequestHeader } from '@tinyhttp/req'

export { getURLParams } from '@tinyhttp/req'

export type Host = {
  hostname: string
  port?: number
}

const trustRemoteAddress = ({ socket }: Pick<Request, 'headers' | 'socket'>, trust: Trust): boolean => {
  const val = socket.remoteAddress
  if (typeof trust !== 'function') trust = compile(trust)
  return trust(val, 0)
}

export const getProtocol = (req: Request, trust: Trust): Protocol => {
  const proto = `http${req.secure ? 's' : ''}`

  if (!trustRemoteAddress(req, trust)) return proto

  const header = (req.headers['X-Forwarded-Proto'] as string) || proto

  const index = header.indexOf(',')

  return index !== -1 ? header.substring(0, index).trim() : header.trim()
}

const normalizeHostString = (host: string): string => decodeURIComponent(host).toLowerCase().normalize()

const getAuthorityHeaderHostString = (req: Request): string | undefined => {
  const authority = req.get(':authority')
  if (Array.isArray(authority)) return undefined
  if (!authority) return undefined

  const index = authority.indexOf('@')
  if (index === -1) return normalizeHostString(authority)
  return normalizeHostString(authority.substring(index + 1))
}

const getForwardedHeaderHostString = (req: Request): string | undefined => {
  const forwardedHost = req.get('x-forwarded-host')
  if (Array.isArray(forwardedHost)) return undefined
  if (!forwardedHost) return undefined

  return normalizeHostString(forwardedHost)
}

const getDefaultHeaderHostString = (req: Request): string | undefined => {
  const host = req.get('host')
  if (!host) return undefined
  if (host.indexOf(',') !== -1) return undefined

  return normalizeHostString(host)
}

const getHostString = (req: Request, trust: Trust): string | undefined => {
  if (trustRemoteAddress(req, trust)) {
    const forwardedHost = getForwardedHeaderHostString(req)
    if (forwardedHost) return forwardedHost
  }

  const authorityHost = getAuthorityHeaderHostString(req)
  const defaultHost = getDefaultHeaderHostString(req)

  if (authorityHost && defaultHost) {
    if (authorityHost !== defaultHost)
      throw new Error('Request `:authority` pseudo-header does not agree with `Host` header')
    return authorityHost
  }

  return authorityHost ?? defaultHost ?? undefined
}

export const getHost = (req: Request, trust: Trust): Host | undefined => {
  const host = getHostString(req, trust)
  if (!host) return undefined

  // IPv6 literal support
  const index = host.indexOf(':', host[0] === '[' ? host.indexOf(']') + 1 : 0)
  if (index === -1) return { hostname: host }

  const hostname = host.substring(0, index)
  const port = Number(host.substring(index + 1))
  if (Number.isNaN(port)) throw new TypeError('Port number is NaN, therefore Host is malformed')
  return { hostname, port }
}

export const getIP = (req: Pick<Request, 'headers' | 'connection' | 'socket'>, trust: Trust): string | undefined =>
  proxyAddr(req, trust).replace(/^.*:/, '') // striping the redundant prefix addeded by OS to IPv4 address

export const getIPs = (req: Pick<Request, 'headers' | 'connection' | 'socket'>, trust: Trust): string[] | undefined =>
  all(req, trust)

export const getSubdomains = (req: Request, trust: Trust, subdomainOffset = 2): string[] => {
  const host = getHost(req, trust)
  if (!host?.hostname) return []

  const subdomains = isIP(host.hostname) ? [host.hostname] : host.hostname.split('.').reverse()

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
  port?: number
  ip?: string
  ips?: string[]
  subdomains?: string[]
  get: <HeaderName extends string>(header: HeaderName) => IncomingHttpHeaders[HeaderName]
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
