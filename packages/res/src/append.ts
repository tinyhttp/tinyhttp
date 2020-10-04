import { IncomingMessage as I, ServerResponse as S } from 'http'

export const append = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (field: string, value: string | number | string[]): Response => {
  const prevVal = res.getHeader(field)
  let newVal = value
  // additional type checks for typescript to not throw errors
  if (prevVal && typeof newVal !== 'number' && typeof prevVal !== 'number') {
    newVal = Array.isArray(prevVal) ? prevVal.concat(newVal) : Array.isArray(newVal) ? [prevVal].concat(newVal) : [prevVal, newVal]
  }
  res.setHeader(field, newVal)
  return res
}
