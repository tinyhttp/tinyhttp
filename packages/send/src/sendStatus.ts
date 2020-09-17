import { IncomingMessage as I, ServerResponse as S } from 'http'
import { STATUS_CODES } from 'http'
import { send } from './send'

/**
 * Sets the response HTTP status code to statusCode and send its string representation as the response body.
 *
 * If an unsupported status code is specified, the HTTP status is still set to statusCode and the string version of the code is sent as the response body.
 *
 * @param _req Request
 * @param res Response
 */
export const sendStatus = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (statusCode: number): Response => {
  const body = STATUS_CODES[statusCode] || String(statusCode)

  res.statusCode = statusCode

  res.setHeader('Content-Type', 'text/plain')

  return send(_req, res)(body)
}
