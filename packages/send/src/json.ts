import { IncomingMessage as I, ServerResponse as S } from 'http'
/**
 * Respond with stringified JSON object
 * @param _req Request
 * @param res Response
 */
export const json = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (body: any, ...args: any[]): Response => {
  res.setHeader('Content-Type', 'application/json')
  if (typeof body === 'object' && body != null) {
    res.end(JSON.stringify(body, null, 2), ...args)
  } else if (typeof body === 'string') {
    res.end(body, ...args)
  }

  return res
}
