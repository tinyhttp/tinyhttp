import { IncomingMessage } from 'http'
import { compile } from '@tinyhttp/proxy-addr'

export const compileTrust = (val: any): any => {
  if (typeof val === 'function') return val

  if (val === true) return () => true

  if (typeof val === 'number') return (_: unknown, i: number) => (val ? i < val : undefined)

  if (typeof val === 'string') return compile(val.split(',').map((x) => x.trim()))

  return compile(val || [])
}

export const trustRemoteAddress = ({ connection }: Pick<IncomingMessage, 'headers' | 'connection'>) =>
  compileTrust(connection.remoteAddress)
