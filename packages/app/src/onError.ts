import { STATUS_CODES } from 'http'
import { Handler } from './router'

export const onErrorHandler = (err: any): Handler => (_req, res) => {
  const code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || STATUS_CODES[code])
}
