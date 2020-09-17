import ipRegex from 'ip-regex'
import { Request, Response } from '@tinyhttp/app'

type Filter = string | RegExp

const processIpFilters = (ip: string, filter: Filter[], strict: boolean): boolean => {
  if (typeof ip !== 'string') {
    throw new TypeError('ip-filter: expect `ip` to be a string')
  }

  const strictMode = strict ?? true

  if (strictMode && !ipRegex().test(ip)) {
    throw new Error(`@tinyhttp/ip-filter: Invalid IP: ${ip}`)
  }

  const results = filter.map((f) => {
    if (typeof f === 'string') {
      const regex = new RegExp(f)

      return regex.test(ip)
    } else if (f instanceof RegExp) {
      return f.test(ip)
    }
  })

  return results.includes(true)
}

export type IPFilterOptions = {
  ip?: string
  strict?: boolean
  filter: Filter[]
  forbidden?: string
}

export const ipFilter = (opts?: IPFilterOptions) => (req: Request, res: Response, next?: (err?: Error) => void) => {
  const ip = opts.ip ?? req.ip

  let isBadIP: boolean

  try {
    isBadIP = processIpFilters(ip, opts.filter, opts.strict)
  } catch (e) {
    next(e)
  }

  if (isBadIP) {
    res.writeHead(403, opts.forbidden ?? '403 Forbidden').end()
  } else {
    next()
  }
}
