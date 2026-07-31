import { Buffer } from 'node:buffer'
import { STATUS_CODES } from 'node:http'
import { escapeHTML } from '@tinyhttp/res'
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
  const isProd = process.env.NODE_ENV === 'production'

  // GHSA-rqg5-h5qr-gp89: always serve error bodies as plain text, refuse
  // MIME-sniffing, and escape any request-influenced content so it cannot be
  // reflected as HTML.
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (code in STATUS_CODES) {
    res.writeHead(code).end(STATUS_CODES[code])
    return
  }

  // Don't leak internal error details in production.
  if (isProd) {
    res.writeHead(500).end(STATUS_CODES[500])
    return
  }

  if (typeof err === 'string') {
    res.writeHead(500).end(escapeHTML(err))
    return
  }

  if (Buffer.isBuffer(err)) {
    res.writeHead(500).end(escapeHTML(err.toString()))
    return
  }

  res.writeHead(500).end(escapeHTML(String(err?.message ?? err)))
}
