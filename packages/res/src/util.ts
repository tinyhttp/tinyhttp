import * as mime from 'es-mime-types'

export const normalizeType = (type: string) => {
  return ~type.indexOf('/') ? acceptParams(type) : { value: mime.lookup(type), params: {} }
}

export function acceptParams(str: string, index?: number) {
  const parts = str.split(/ *; */)
  const ret = { value: parts[0], quality: 1, params: {}, originalIndex: index }

  for (const part of parts) {
    const pms = part.split(/ *= */)
    if ('q' === pms[0]) {
      ret.quality = parseFloat(pms[1])
    } else {
      ret.params[pms[0]] = pms[1]
    }
  }

  return ret
}

export function normalizeTypes(types: string[]) {
  const ret = []

  for (const type of types) {
    ret.push(normalizeType(type))
  }

  return ret
}
