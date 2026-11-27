import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http'

const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/

const compareETags = (etag: string, str: string) => str === etag || str === `W/${etag}` || `W/${str}` === etag

const isOWS = (char: string | undefined) => char === ' ' || char === '\t'

function includesETag(etag: string, noneMatch: string) {
  let start = 0
  let inTag = false

  for (let i = 0; i <= noneMatch.length; i++) {
    const char = noneMatch[i]
    if (char === '"') inTag = !inTag
    if (!inTag && (char === ',' || i === noneMatch.length)) {
      // A comma can appear within an opaque tag. Only trim HTTP OWS.
      let end = i
      while (start < end && isOWS(noneMatch[start])) start++
      while (start < end && isOWS(noneMatch[end - 1])) end--
      if (compareETags(etag, noneMatch.slice(start, end))) return true
      start = i + 1
    }
  }

  return false
}

/**
 * Check freshness of the response using request and response headers.
 */
export function fresh(reqHeaders: IncomingHttpHeaders, resHeaders: OutgoingHttpHeaders) {
  const modifiedSince = reqHeaders['if-modified-since']
  const noneMatch = reqHeaders['if-none-match']

  if (!modifiedSince && noneMatch === undefined) return false

  const cacheControl = reqHeaders['cache-control']
  if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) return false

  // RFC 9110 §13.1.3: If-None-Match takes precedence over If-Modified-Since.
  if (noneMatch !== undefined) {
    if (noneMatch === '*') return true
    const etag = resHeaders.etag
    return typeof etag === 'string' && etag.length > 0 && includesETag(etag, noneMatch)
  }

  // if-modified-since
  if (modifiedSince) {
    const lastModified = resHeaders['last-modified'] as string | undefined

    if (!lastModified || !(Date.parse(lastModified) <= Date.parse(modifiedSince))) return false
  }

  return true
}
