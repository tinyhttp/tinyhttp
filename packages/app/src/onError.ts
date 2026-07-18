import { STATUS_CODES } from 'node:http'
import type { NextFunction } from '@tinyhttp/router'
import type { App } from './app.js'
import type { Request } from './request.js'
import type { Response } from './response.js'

export type ErrorHandler = (this: App, err: any, req: Request, res: Response, next?: NextFunction) => void

export const onErrorHandler: ErrorHandler = function (this: App, err: any, _req: Request, res: Response) {
  if (this.onError === onErrorHandler && this.parent) return this.parent.onError(err, _req, res)

  if (err instanceof Error) console.error(err)

  // If the response headers are already committed we can no longer write a
  // status line. Attempting to do so throws ERR_HTTP_HEADERS_SENT, which would
  // be uncaught and crash the process. Just tear the socket down instead.
  if (res.headersSent) {
    res.destroy()
    return
  }

  const code = err.code in STATUS_CODES ? err.code : err.status

  if (typeof err === 'string' || Buffer.isBuffer(err)) res.writeHead(500).end(err)
  else if (code in STATUS_CODES) res.writeHead(code).end(STATUS_CODES[code])
  else res.writeHead(500).end(err.message)
}
