import { lookup } from 'es-mime-types'
import * as typer from 'es-content-type'

function normalizeType(value: string) {
  // parse the type
  const type = typer.parse(value)
  type.parameters = {}
  // reformat it
  return typer.format(type)
}

function tryNormalizeType(value: string) {
  if (!value) return null

  try {
    return normalizeType(value)
  } catch (err) {
    return null
  }
}

function mimeMatch(expected: string | boolean, actual: string | boolean) {
  // invalid type
  if (expected === false) {
    return false
  }

  // split types
  const actualParts = (actual as string).split('/')
  const expectedParts = (expected as string).split('/')

  // invalid format
  if (actualParts.length !== 2 || expectedParts.length !== 2) {
    return false
  }

  // validate type
  if (expectedParts[0] !== '*' && expectedParts[0] !== actualParts[0]) {
    return false
  }

  // validate suffix wildcard
  if (expectedParts[1].substr(0, 2) === '*+') {
    return expectedParts[1].length <= actualParts[1].length + 1 && expectedParts[1].substr(1) === actualParts[1].substr(1 - expectedParts[1].length)
  }

  // validate subtype
  if (expectedParts[1] !== '*' && expectedParts[1] !== actualParts[1]) {
    return false
  }

  return true
}

function normalize(type: string | unknown) {
  if (typeof type !== 'string') {
    // invalid type
    return false
  }

  switch (type) {
    case 'urlencoded':
      return 'application/x-www-form-urlencoded'
    case 'multipart':
      return 'multipart/*'
  }

  if (type[0] === '+') {
    // "+json" -> "*/*+json" expando
    return '*/*' + type
  }

  return type.indexOf('/') === -1 ? lookup(type) : type
}

/**
 * Compare a `value` content-type with `types`.
 * Each `type` can be an extension like `html`,
 * a special shortcut like `multipart` or `urlencoded`,
 * or a mime type.
 */
export const typeIs = (value: string, ...types: string[]) => {
  let i: number
  // remove parameters and normalize
  const val = tryNormalizeType(value)

  // no type or invalid
  if (!val) {
    return false
  }

  // no types, return the content type
  if (!types || !types.length) {
    return val
  }

  let type
  for (i = 0; i < types.length; i++) {
    if (mimeMatch(normalize((type = types[i])), val)) {
      return type[0] === '+' || type.indexOf('*') !== -1 ? val : type
    }
  }

  // no matches
  return false
}
