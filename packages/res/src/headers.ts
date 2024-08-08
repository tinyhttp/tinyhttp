import type { OutgoingHttpHeaders } from 'node:http'
import type { IncomingMessage as Req, ServerResponse as Res } from 'node:http'
import { encodeUrl } from '@tinyhttp/encode-url'
import { getRequestHeader } from '@tinyhttp/req'
import { vary } from '@tinyhttp/vary'
import mime from 'mime'

const charsetRegExp = /;\s*charset\s*=/

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
          const charset = 'UTF-8' // UTF-8 is the default charset for all types

          if (typeof charset === 'string') value += `; charset=${charset.toLowerCase()}`
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

    // set location
    res.setHeader('Location', encodeUrl(loc))
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
    const ct = type.indexOf('/') === -1 ? mime.getType(type) : type

    setHeader(res)('Content-Type', ct)

    return res
  }
