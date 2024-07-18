import type { IncomingMessage } from 'node:http'

export function createReq(socketAddr: string, headers?: Record<string, string>): IncomingMessage {
  return {
    socket: {
      remoteAddress: socketAddr
    },
    headers: headers || {}
  } as IncomingMessage
}
