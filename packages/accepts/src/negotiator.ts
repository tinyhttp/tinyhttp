/**
 * Inlined negotiator functionality
 * Based on negotiator (https://github.com/jshttp/negotiator)
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import type { IncomingMessage } from 'node:http'

interface Spec {
  i: number
  o: number
  q: number
  s: number
}

function compareByQI(a: { q: number; i: number }, b: { q: number; i: number }): number {
  return b.q - a.q || a.i - b.i || 0
}

// ============================================================================
// Charset
// ============================================================================

interface CharsetSpec {
  charset: string
  q: number
  i: number
}

const simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/

function parseAcceptCharset(accept: string): CharsetSpec[] {
  return accept.split(',').flatMap((s, i) => {
    const spec = parseCharset(s.trim(), i)
    return spec ? [spec] : []
  })
}

function parseCharset(str: string, i: number): CharsetSpec | null {
  const match = simpleCharsetRegExp.exec(str)
  if (!match) return null

  const charset = match[1]
  const qParam = match[2]?.split(';').find((p) => p.trim().startsWith('q='))
  const q = qParam ? parseFloat(qParam.split('=')[1]) : 1

  return { charset, q, i }
}

function getCharsetPriority(charset: string, accepted: CharsetSpec[], index: number): Spec {
  return accepted.reduce<Spec>(
    (priority, acc) => {
      const spec = specifyCharset(charset, acc, index)
      return spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0 ? spec : priority
    },
    { o: -1, q: 0, s: 0, i: index }
  )
}

function specifyCharset(charset: string, spec: CharsetSpec, index: number): Spec | null {
  let s = 0
  if (spec.charset.toLowerCase() === charset.toLowerCase()) {
    s |= 1
  } else if (spec.charset !== '*') {
    return null
  }

  return { i: index, o: spec.i, q: spec.q, s }
}

function preferredCharsets(accept: string | undefined, provided?: string[]): string[] {
  const accepts = parseAcceptCharset(accept === undefined ? '*' : accept || '')

  if (!provided) {
    return accepts
      .filter(isQuality)
      .sort(compareByQI)
      .map((spec) => spec.charset)
  }

  const priorities = provided.map((type, index) => getCharsetPriority(type, accepts, index))

  return priorities
    .filter(isQuality)
    .sort(compareSpecs)
    .map((priority) => provided[priorities.indexOf(priority)])
}

// ============================================================================
// Encoding
// ============================================================================

interface EncodingSpec {
  encoding: string
  q: number
  i: number
}

const simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/

function parseAcceptEncoding(accept: string): EncodingSpec[] {
  const accepts = accept.split(',')
  const result = accepts.flatMap((s, i) => {
    const spec = parseEncoding(s.trim(), i)
    return spec ? [spec] : []
  })
  const hasIdentity = result.some((enc) => specifyEncoding('identity', enc, 0) !== null)
  if (!hasIdentity) {
    const minQuality = result.reduce((min, enc) => Math.min(min, enc.q || 1), 1)
    result.push({ encoding: 'identity', q: minQuality, i: accepts.length })
  }
  return result
}

function parseEncoding(str: string, i: number): EncodingSpec | null {
  const match = simpleEncodingRegExp.exec(str)
  if (!match) return null

  const encoding = match[1]
  const qParam = match[2]?.split(';').find((p) => p.trim().startsWith('q='))
  const q = qParam ? parseFloat(qParam.split('=')[1]) : 1

  return { encoding, q, i }
}

function getEncodingPriority(encoding: string, accepted: EncodingSpec[], index: number): Spec & { encoding: string } {
  return accepted.reduce<Spec & { encoding: string }>(
    (priority, acc) => {
      const spec = specifyEncoding(encoding, acc, index)
      return spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0 ? spec : priority
    },
    { encoding, o: -1, q: 0, s: 0, i: index }
  )
}

function specifyEncoding(encoding: string, spec: EncodingSpec, index: number): (Spec & { encoding: string }) | null {
  let s = 0
  if (spec.encoding.toLowerCase() === encoding.toLowerCase()) {
    s |= 1
  } else if (spec.encoding !== '*') {
    return null
  }

  return { encoding, i: index, o: spec.i, q: spec.q, s }
}

function preferredEncodings(accept: string | undefined, provided?: string[]): string[] {
  const accepts = parseAcceptEncoding(accept || '')

  if (!provided) {
    return accepts
      .filter(isQuality)
      .sort(compareByQI)
      .map((spec) => spec.encoding)
  }

  const priorities = provided.map((type, index) => getEncodingPriority(type, accepts, index))

  return priorities
    .filter(isQuality)
    .sort(compareSpecs)
    .map((priority) => provided[priorities.indexOf(priority)])
}

// ============================================================================
// Language
// ============================================================================

interface LanguageSpec {
  prefix: string
  suffix: string | undefined
  full: string
  q: number
  i: number
}

const simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/

function parseAcceptLanguage(accept: string): LanguageSpec[] {
  return accept.split(',').flatMap((s, i) => {
    const spec = parseLanguage(s.trim(), i)
    return spec ? [spec] : []
  })
}

function parseLanguage(str: string, i: number): LanguageSpec | null {
  const match = simpleLanguageRegExp.exec(str)
  if (!match) return null

  const prefix = match[1]
  const suffix = match[2]
  const full = suffix ? `${prefix}-${suffix}` : prefix
  const qParam = match[3]?.split(';').find((p) => p.startsWith('q='))
  const q = qParam ? parseFloat(qParam.split('=')[1]) : 1

  return { prefix, suffix, q, i, full }
}

function getLanguagePriority(language: string, accepted: LanguageSpec[], index: number): Spec {
  return accepted.reduce<Spec>(
    (priority, acc) => {
      const spec = specifyLanguage(language, acc, index)
      return spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0 ? spec : priority
    },
    { o: -1, q: 0, s: 0, i: index }
  )
}

function specifyLanguage(language: string, spec: LanguageSpec, index: number): Spec | null {
  const p = parseLanguage(language, 0)
  if (!p) return null

  let s = 0
  if (spec.full.toLowerCase() === p.full.toLowerCase()) {
    s |= 4
  } else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) {
    s |= 2
  } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
    s |= 1
  } else if (spec.full !== '*') {
    return null
  }

  return { i: index, o: spec.i, q: spec.q, s }
}

function preferredLanguages(accept: string | undefined, provided?: string[]): string[] {
  const accepts = parseAcceptLanguage(accept === undefined ? '*' : accept || '')

  if (!provided) {
    return accepts
      .filter(isQuality)
      .sort(compareByQI)
      .map((spec) => spec.full)
  }

  const priorities = provided.map((type, index) => getLanguagePriority(type, accepts, index))

  return priorities
    .filter(isQuality)
    .sort(compareSpecs)
    .map((priority) => provided[priorities.indexOf(priority)])
}

// ============================================================================
// Media Type
// ============================================================================

interface MediaTypeSpec {
  type: string
  subtype: string
  params: Record<string, string>
  q: number
  i: number
}

const simpleMediaTypeRegExp = /^\s*([^\s/;]+)\/([^;\s]+)\s*(?:;(.*))?$/

function parseAccept(accept: string): MediaTypeSpec[] {
  return splitMediaTypes(accept).flatMap((s, i) => {
    const spec = parseMediaType(s.trim(), i)
    return spec ? [spec] : []
  })
}

function parseMediaType(str: string, i: number): MediaTypeSpec | null {
  const match = simpleMediaTypeRegExp.exec(str)
  if (!match) return null

  const params: Record<string, string> = Object.create(null)
  let q = 1
  const subtype = match[2]
  const type = match[1]

  if (match[3]) {
    const kvps = splitParameters(match[3]).map(splitKeyValuePair)
    for (const pair of kvps) {
      const key = pair[0].toLowerCase()
      const val = pair[1]
      const value = val && val[0] === '"' && val[val.length - 1] === '"' ? val.slice(1, -1) : val

      if (key === 'q') {
        q = parseFloat(value)
        break
      }

      params[key] = value
    }
  }

  return { type, subtype, params, q, i }
}

function getMediaTypePriority(type: string, accepted: MediaTypeSpec[], index: number): Spec {
  return accepted.reduce<Spec>(
    (priority, acc) => {
      const spec = specifyMediaType(type, acc, index)
      return spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0 ? spec : priority
    },
    { o: -1, q: 0, s: 0, i: index }
  )
}

function specifyMediaType(type: string, spec: MediaTypeSpec, index: number): Spec | null {
  const p = parseMediaType(type, 0)
  if (!p) return null

  let s = 0

  if (spec.type.toLowerCase() === p.type.toLowerCase()) {
    s |= 4
  } else if (spec.type !== '*') {
    return null
  }

  if (spec.subtype.toLowerCase() === p.subtype.toLowerCase()) {
    s |= 2
  } else if (spec.subtype !== '*') {
    return null
  }

  const keys = Object.keys(spec.params)
  if (keys.length > 0) {
    if (
      keys.every(
        (k) => spec.params[k] === '*' || (spec.params[k] || '').toLowerCase() === (p.params[k] || '').toLowerCase()
      )
    ) {
      s |= 1
    } else {
      return null
    }
  }

  return { i: index, o: spec.i, q: spec.q, s }
}

function preferredMediaTypes(accept: string | undefined, provided?: string[]): string[] {
  const accepts = parseAccept(accept === undefined ? '*/*' : accept || '')

  if (!provided) {
    return accepts
      .filter(isQuality)
      .sort(compareByQI)
      .map((spec) => `${spec.type}/${spec.subtype}`)
  }

  const priorities = provided.map((type, index) => getMediaTypePriority(type, accepts, index))

  return priorities
    .filter(isQuality)
    .sort(compareSpecs)
    .map((priority) => provided[priorities.indexOf(priority)])
}

function quoteCount(str: string): number {
  return (str.match(/"/g) || []).length
}

function splitKeyValuePair(str: string): [string, string] {
  const i = str.indexOf('=')
  return i === -1 ? [str, ''] : [str.slice(0, i), str.slice(i + 1)]
}

function splitMediaTypes(accept: string): string[] {
  const accepts = accept.split(',')
  let j = 0

  for (let i = 1; i < accepts.length; i++) {
    if (quoteCount(accepts[j]) % 2 === 0) {
      accepts[++j] = accepts[i]
    } else {
      accepts[j] += ',' + accepts[i]
    }
  }

  return accepts.slice(0, j + 1)
}

function splitParameters(str: string): string[] {
  const parameters = str.split(';')
  let j = 0

  for (let i = 1; i < parameters.length; i++) {
    if (quoteCount(parameters[j]) % 2 === 0) {
      parameters[++j] = parameters[i]
    } else {
      parameters[j] += ';' + parameters[i]
    }
  }

  return parameters.slice(0, j + 1).map((p) => p.trim())
}

// ============================================================================
// Shared utilities
// ============================================================================

function compareSpecs(a: Spec, b: Spec): number {
  return b.q - a.q || b.s - a.s || a.o - b.o || a.i - b.i || 0
}

function isQuality(spec: { q: number }): boolean {
  return spec.q > 0
}

// ============================================================================
// Negotiator class
// ============================================================================

export class Negotiator {
  #request: Pick<IncomingMessage, 'headers'>

  constructor(request: Pick<IncomingMessage, 'headers'>) {
    this.#request = request
  }

  charsets(available?: string[]): string[] {
    const header = this.#request.headers['accept-charset']
    const accept = Array.isArray(header) ? header.join(', ') : header
    return preferredCharsets(accept, available)
  }

  encodings(available?: string[]): string[] {
    const header = this.#request.headers['accept-encoding']
    const accept = Array.isArray(header) ? header.join(', ') : header
    return preferredEncodings(accept, available)
  }

  languages(available?: string[]): string[] {
    const header = this.#request.headers['accept-language']
    const accept = Array.isArray(header) ? header.join(', ') : header
    return preferredLanguages(accept, available)
  }

  mediaTypes(available?: string[]): string[] {
    const header = this.#request.headers['accept']
    const accept = Array.isArray(header) ? header.join(', ') : header
    return preferredMediaTypes(accept, available)
  }
}
