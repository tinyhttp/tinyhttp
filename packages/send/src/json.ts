import { ServerResponse as S } from 'http'

type Res = Pick<S, 'setHeader' | 'end'>

/**
 * Respond with stringified JSON object
 * @param res Response
 */
export const json = <Response extends Res = Res>(res: Response) => (body: any, ...args: any[]): Response => {
  res.setHeader('Content-Type', 'application/json')
  if (typeof body === 'object' && body != null) res.end(JSON.stringify(body, null, 2), ...args)
  else if (typeof body === 'string') res.end(body, ...args)
  else if(body == null) res.end(null, ...args)
  return res
}
