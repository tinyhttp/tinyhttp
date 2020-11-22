import { IncomingMessage as I, ServerResponse as S } from 'http'

type Res = Pick<S, 'statusCode'>

/**
 * Sets the HTTP status for the response. It is a chainable alias of Node’s `response.statusCode`.
 *
 * @param res Response
 */
export const status = <Response extends Res = Res>(res: Response) => (status: number): Response => {
  res.statusCode = status

  return res
}
