import * as mime from 'es-mime-types'

export type NormalizedType = {
  value: string
  quality?: number
  params: Record<string, string>
  originalIndex?: number
}

export const normalizeType = (type: string): NormalizedType =>
  ~type.indexOf('/') ? acceptParams(type) : { value: mime.lookup(type), params: {} }

export function acceptParams(str: string, index?: number): NormalizedType {
  const parts = str.split(/ *; */)
  const ret: NormalizedType = { value: parts[0], quality: 1, params: {}, originalIndex: index }

  for (const part of parts) {
    const pms = part.split(/ *= */)
    if ('q' === pms[0]) ret.quality = parseFloat(pms[1])
    else ret.params[pms[0]] = pms[1]
  }

  return ret
}

export function normalizeTypes(types: string[]): NormalizedType[] {
  const ret: NormalizedType[] = []

  for (const type of types) {
    ret.push(normalizeType(type))
  }

  return ret
}
