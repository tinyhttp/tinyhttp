import type { OutgoingHttpHeaders, IncomingMessage as Req, ServerResponse as Res } from 'node:http'
import { encodeUrl } from '@tinyhttp/encode-url'
import { getRequestHeader } from '@tinyhttp/req'
import { vary } from '@tinyhttp/vary'
import { lookup } from 'mrmime'

const charsetRegExp = /;\s*charset\s*=/
const schemeAndHostRegExp = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\/[^\\/?#]+/
export const setHeader =
  <Response extends Res = Res>(res: Response) =>
  (field: string | Record<string, string | number | string[]>, val?: string | number | readonly string[]): Response => {
    if (typeof field === 'string') {
      let value = Array.isArray(val) ? val.map(String) : String(val)
      // add charset to content-type
      if (field.toLowerCase() === 'content-type') {
        if (Array.isArray(value)) {
          throw new TypeError('Content-Type cannot be set to an Array')
        }
        if (!charsetRegExp.test(value)) {
          value += '; charset=utf-8'
        }
      }
      res.setHeader(field, value)
    } else {
      for (const key in field) {
        setHeader(res)(key, field[key] as string)
      }
    }
    return res
  }
export const setLocationHeader =
  <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) =>
  (url: string): Response => {
    let loc = url
    // "back" is an alias for the referrer
    if (url === 'back') loc = (getRequestHeader(req)('Referrer') as string) || '/'
    const match = schemeAndHostRegExp.exec(loc)
    // Encode everything after the scheme + authority. The `schemeAndHostRegExp`
    // match stops at the first `\`, `/`, `?` or `#`, so any of those delimiters
    // (including a backslash smuggled into the authority) falls into the encoded
    // portion. This prevents an open redirect via a raw backslash such as
    // `https://evil.com\@trusted.com`, which some URL parsers resolve to
    // `evil.com` (GHSA-8q4p-mhxr-fq83), while leaving the real host verbatim so
    // redirect allowlists still see it.
    const pos = match ? match[0].length : 0
    res.setHeader('Location', loc.slice(0, pos) + encodeUrl(loc.slice(pos)))
    return res
  }
export const getResponseHeader = <Response extends Res = Res>(res: Response) => {
  return <HeaderName extends string>(field: HeaderName): OutgoingHttpHeaders[HeaderName] => {
    return res.getHeader(field)
  }
}
export const setLinksHeader =
  <Response extends Res = Res>(res: Response) =>
  (links: { [key: string]: string }): Response => {
    let link = res.getHeader('Link') || ''
    if (link) link += ', '
    res.setHeader(
      'Link',
      link +
        Object.keys(links)
          .map((rel) => `<${links[rel]}>; rel="${rel}"`)
          .join(', ')
    )
    return res
  }
export const setVaryHeader =
  <Response extends Res = Res>(res: Response) =>
  (field: string): Response => {
    vary(res, field)
    return res
  }
export const setContentType =
  <Response extends Res = Res>(res: Response) =>
  (type: string): Response => {
    const ct = type.indexOf('/') === -1 ? lookup(type) : type
    setHeader(res)('Content-Type', ct as string)
    return res
  }
