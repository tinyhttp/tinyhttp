import { IncomingMessage } from 'node:http'

/**
 * Parse the X-Forwarded-For header.
 */
export const parse = (header: string) => {
  let end = header.length
  let start = header.length
  const list: string[] = []
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
  /* c8 ignore next */
}

/**
 * Get all addresses in the request, using the `X-Forwarded-For` header.
 */
export function forwarded(req: Pick<IncomingMessage, 'headers' | 'socket'>): string[] {
  // simple header parsing
  const proxyAddrs = parse((req.headers['x-forwarded-for'] as string) || '')
  const socketAddr = req.socket.remoteAddress

  // return all addresses
  return [socketAddr].concat(proxyAddrs)
}
