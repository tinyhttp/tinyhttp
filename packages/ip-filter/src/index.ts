import type { IncomingMessage as Request, ServerResponse as Response } from 'node:http'
import ipRegex from 'ip-regex'

type Filter = string | RegExp

const processIpFilters = (ip: string, filter: Filter[], strict?: boolean): boolean => {
  if ((strict ?? true) && !ipRegex().test(ip)) throw new Error(`@tinyhttp/ip-filter: Invalid IP: ${ip}`)

  const results = filter.map((f) => {
    if (typeof f === 'string') {
      return new RegExp(f).test(ip)
    }
    if (f instanceof RegExp) return f.test(ip)
    return undefined
  })

  return results.includes(true)
}

export type IPFilterOptions = {
  ip?: string
  strict?: boolean
  filter: Filter[]
  forbidden?: string
}

export const ipFilter =
  (opts: IPFilterOptions = { filter: [] }) =>
  (req: Request & { ip?: string }, res: Response, next?: (err?: Error) => void): void => {
    const ip = opts.ip ?? req.ip

    if (typeof ip !== 'string') throw new TypeError('ip-filter: expect `ip` to be a string')

    let isBadIP: boolean

    try {
      isBadIP = processIpFilters(ip, opts.filter, opts.strict)
    } catch (e) {
      return next?.(e as Error)
    }

    if (isBadIP) {
      res.writeHead(403, opts.forbidden ?? '403 Forbidden').end()
    } else {
      next?.()
    }
  }
