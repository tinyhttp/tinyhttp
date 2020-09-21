import { IncomingMessage as I, ServerResponse as S } from 'http'
import * as mime from 'es-mime-types'
import { getRequestHeader } from '@tinyhttp/req'
import { vary } from 'es-vary'

const charsetRegExp = /;\s*charset\s*=/

export const setHeader = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (
  field: string | Record<string, string | number | string[]>,
  val?: string | any[]
): Response => {
  if (typeof field === 'string') {
    let value = Array.isArray(val) ? val.map(String) : String(val)

    // add charset to content-type
    if (field.toLowerCase() === 'content-type') {
      if (Array.isArray(value)) {
        throw new TypeError('Content-Type cannot be set to an Array')
      }
      if (!charsetRegExp.test(value)) {
        const charset = mime.lookup(value.split(';')[0])
        if (charset) value += '; charset=' + charset.toLowerCase()
      }
    }

    res.setHeader(field, value)
  } else {
    for (const key in field) {
      res.setHeader(key, field[key])
    }
  }
  return res
}

export const setLocationHeader = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (url: string): Response => {
  let loc = url

  // "back" is an alias for the referrer
  if (url === 'back') {
    loc = (getRequestHeader(req)('Referrer') as string) || '/'
  }

  // set location
  res.setHeader('Location', loc[0] + encodeURIComponent(loc.slice(1)))
  return res
}

export const getResponseHeader = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (field: string): string | number | string[] => {
  return res.getHeader(field)
}

export const setLinksHeader = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (links: { [key: string]: string }): Response => {
  let link = res.getHeader('Link') || ''
  if (link) link += ', '
  setHeader(req, res)(
    'Link',
    link +
      Object.keys(links)
        .map((rel) => '<' + links[rel] + '>; rel="' + rel + '"')
        .join(', ')
  )

  return res
}

export const setVaryHeader = <Request extends I = I, Response extends S = S>(_req: Request, res: Response) => (field: string): Response => {
  vary(res, field)

  return res
}

export const setContentType = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (type: string): Response => {
  const ct = type.indexOf('/') === -1 ? mime.lookup(type) : type

  return setHeader(req, res)('Content-Type', ct)
}
