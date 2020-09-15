import { IncomingMessage as I, ServerResponse as S } from 'http'

/**
 * Sets the HTTP status for the response. It is a chainable alias of Node’s `response.statusCode`.
 *
 * @param _req Request
 * @param res Response
 */
export const status = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (status: number): Response => {
  res.statusCode = status

  return res
}
