import { STATUS_CODES } from 'http'
import { ErrorHandler } from './router'
import { Request } from './request'
import { Response } from './response'

export const onErrorHandler: ErrorHandler = (err: any, _req: Request, res: Response) => {
  const code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || STATUS_CODES[code])
}
