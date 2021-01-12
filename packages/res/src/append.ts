import { IncomingMessage as I, ServerResponse as S } from 'http'
import { getResponseHeader } from './headers'

type Res = Pick<S, 'getHeader' | 'setHeader'>

export const append = <Response extends Res = Res>(res: Response) => (
  field: string,
  value: string | number | string[]
): Response => {
  const prevVal = getResponseHeader(res)(field)
  let newVal = value

  if (prevVal && typeof newVal !== 'number' && typeof prevVal !== 'number') {
    newVal = Array.isArray(prevVal)
      ? prevVal.concat(newVal)
      : Array.isArray(newVal)
      ? [prevVal].concat(newVal)
      : [prevVal, newVal]
  }
  res.setHeader(field, newVal)
  return res
}
