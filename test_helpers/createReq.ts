import type { IncomingMessage } from 'node:http'

export const createReq = (socketAddr: string, headers?: Record<string, string>): IncomingMessage =>
  ({
    socket: {
      remoteAddress: socketAddr
    },
    headers: headers || {}
  }) as IncomingMessage
