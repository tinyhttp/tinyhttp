import { ServerResponse as S } from 'node:http'

type Res = Pick<S, 'setHeader' | 'end' | 'removeHeader'>

/**
 * Respond with stringified JSON object
 * @param res Response
 */
export const json =
  <Response extends Res = Res>(res: Response) =>
  (body: any, ...args: any[]): Response => {
    res.setHeader('Content-Type', 'application/json')
    if (body == null) {
      res.removeHeader('Content-Length')
      res.removeHeader('Transfer-Encoding')
      res.end(null, ...args)
    } else if (typeof body === 'string') res.end(body, ...args)
    else res.end(JSON.stringify(body, null, 2), ...args) 

    return res
  }
