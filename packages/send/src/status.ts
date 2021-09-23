import { ServerResponse } from 'http'

type Res = Pick<ServerResponse, 'statusCode'>

/**
 * Sets the HTTP status for the response. It is a chainable alias of Node’s `response.statusCode`.
 *
 * @param res Response
 */
export const status =
  <Response extends Res = Res>(res: Response) =>
  (status: number): Response => {
    res.statusCode = status

    return res
  }
