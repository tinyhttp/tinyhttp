import { ServerResponse } from 'http'
import { parse, format } from 'content-type'
import etag from '@tinyhttp/etag'
import { Request } from './request'

const createETag = (body: Buffer | string, encoding: 'utf8' | undefined) => {
  const buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body
  return etag(buf, { weak: true })
}

function setCharset(type: string, charset: string) {
  const parsed = parse(type)
  parsed.parameters.charset = charset
  return format(parsed)
}

export const json = (_: Request, res: Response, body: any, ...args: any[]) => {
  res.setHeader('Content-Type', 'application/json')
  if (typeof body === 'object' && body != 'null') {
    res.end(JSON.stringify(body, null, 2), ...args)
  } else if (typeof body === 'string') {
    res.end(body, ...args)
  }
}

export const send = (req: Request, res: Response, body: any) => {
  let bodyToSend = body

  // in case of object - turn it to json
  if (typeof body === 'object' && body !== 'null') {
    bodyToSend = JSON.stringify(body, null, 2)
  } else {
    if (typeof body === 'string') {
      // reflect this in content-type
      const type = res.getHeader('Content-Type')
      if (typeof type === 'string') {
        res.setHeader('Content-Type', setCharset(type, 'utf-8'))
      }
    }
  }

  // Set encoding
  let encoding: 'utf8' | undefined = 'utf8'

  // populate ETag
  let etag: string | undefined
  if (!res.getHeader('etag') && (etag = createETag(bodyToSend, encoding))) {
    res.setHeader('etag', etag)
  }

  // strip irrelevant headers
  if (res.statusCode === 204 || res.statusCode === 304) {
    res.removeHeader('Content-Type')
    res.removeHeader('Content-Length')
    res.removeHeader('Transfer-Encoding')
    bodyToSend = ''
  }

  if (req.method === 'HEAD') {
    res.end('')
  }

  if (typeof body === 'object') {
    if (body === null) {
      res.end('')
    } else if (Buffer.isBuffer(body)) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('content-type', 'application/octet-stream')
      }
    } else {
      encoding ? json(req, res, bodyToSend, encoding) : json(req, res, bodyToSend)
    }
  } else {
    if (encoding) {
      // respond with encoding
      res.end(bodyToSend, encoding)
    } else {
      // respond without encoding
      res.end(bodyToSend)
    }
  }
}

export interface Response extends ServerResponse {
  send(body: unknown): void
  json(body: unknown): void
}
