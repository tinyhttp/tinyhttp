import type { NextFunction } from '@tinyhttp/router'
import { STATUS_CODES } from 'node:http'
import type { Request } from './request.js'
import type { Response } from './response.js'
import type { App } from './app.js'

export type ErrorHandler = (this: App, err: any, req: Request, res: Response, next?: NextFunction) => void

export const onErrorHandler: ErrorHandler = function (this: App, err: any, _req: Request, res: Response) {
  if (this.onError === onErrorHandler && this.parent) return this.parent.onError(err, _req, res)

  if (err instanceof Error) console.error(err)

  const code = err.code in STATUS_CODES ? err.code : err.status

  if (typeof err === 'string' || Buffer.isBuffer(err)) res.writeHead(500).end(err)
  else if (code in STATUS_CODES) res.writeHead(code).end(STATUS_CODES[code])
  else res.writeHead(500).end(err.message)
}
