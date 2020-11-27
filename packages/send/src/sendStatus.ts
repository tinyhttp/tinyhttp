import { IncomingMessage as I, ServerResponse as S } from 'http'
import { STATUS_CODES } from 'http'
import { send } from './send'

type Req = Pick<I, 'method'>

type Res = Pick<S, 'setHeader' | 'removeHeader' | 'end' | 'getHeader' | 'statusCode'>

/**
 * Sets the response HTTP status code to statusCode and send its string representation as the response body.
 *
 * If an unsupported status code is specified, the HTTP status is still set to statusCode and the string version of the code is sent as the response body.
 *
 * @param req Request
 * @param res Response
 */
export const sendStatus = <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) => (
  statusCode: number
): Response => {
  const body = STATUS_CODES[statusCode] || String(statusCode)

  res.statusCode = statusCode

  res.setHeader('Content-Type', 'text/plain')

  return send(req, res)(body)
}
