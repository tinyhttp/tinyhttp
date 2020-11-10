import { NextFunction } from '@tinyhttp/router'
import { STATUS_CODES } from 'http'
import { Request } from './request'
import { Response } from './response'

export type ErrorHandler = (err: any, req: Request, res: Response, next?: NextFunction) => void

export const onErrorHandler: ErrorHandler = (err: any, _req: Request, res: Response) => {
  if (!res.writableEnded) {
    const code = err.code in STATUS_CODES ? err.code : err.status

    if (typeof err === 'string' || Buffer.isBuffer(err)) {
      res.statusCode = 500
      res.end(err)
    } else if (code in STATUS_CODES) {
      res.statusCode = code
      res.end(STATUS_CODES[code])
    } else {
      res.statusCode = 500
      res.end(err.message)
    }
  }
}
