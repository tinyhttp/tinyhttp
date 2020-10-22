import { IncomingMessage } from 'http'

/**
 * Get all addresses in the request, using the `X-Forwarded-For` header.
 */
export function forwarded(req: IncomingMessage) {
  if (!req) {
    throw new TypeError('argument req is required')
  }

  // simple header parsing
  const proxyAddrs = parse((req.headers['x-forwarded-for'] as string) || '')
  const socketAddr = req.connection.remoteAddress
  const addrs = [socketAddr].concat(proxyAddrs)

  // return all addresses
  return addrs
}

/**
 * Parse the X-Forwarded-For header.
 */
export function parse(header: string) {
  let end = header.length
  const list = []
  let start = header.length

  // gather addresses, backwards
  for (let i = header.length - 1; i >= 0; i--) {
    switch (header.charCodeAt(i)) {
      case 0x20 /*   */:
        if (start === end) {
          start = end = i
        }
        break
      case 0x2c /* , */:
        if (start !== end) {
          list.push(header.substring(start, end))
        }
        start = end = i
        break
      default:
        start = i
        break
    }
  }

  // final address
  if (start !== end) list.push(header.substring(start, end))

  return list
}
