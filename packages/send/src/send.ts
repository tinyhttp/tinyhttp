import { IncomingMessage as I, ServerResponse as S } from 'http'
import { json } from './json'
import { setCharset, createETag } from './utils'

type Req = Pick<I, 'method'>

type Res = Pick<S, 'setHeader' | 'removeHeader' | 'end' | 'getHeader' | 'statusCode'>

/**
 * Sends the HTTP response.
 *
 * The body parameter can be a Buffer object, a string, an object, or an array.
 *
 * This method performs many useful tasks for simple non-streaming responses.
 * For example, it automatically assigns the Content-Length HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.
 *
 * @param req Request
 * @param res Response
 */
export const send = <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) => (
  body: any
): Response => {
  let bodyToSend = body

  if (Buffer.isBuffer(body)) {
    bodyToSend = body
  } else if (typeof body === 'object' && body !== null) {
    // in case of object - turn it to json
    bodyToSend = JSON.stringify(body, null, 2)
  } else if (typeof body === 'string') {
    // reflect this in content-type
    const type = res.getHeader('Content-Type')

    if (type && typeof type === 'string') {
      res.setHeader('Content-Type', setCharset(type, 'utf-8'))
    } else res.setHeader('Content-Type', setCharset('text/html', 'utf-8'))
  }

  // Set encoding
  const encoding: 'utf8' | undefined = 'utf8'

  // populate ETag
  let etag: string | undefined
  if (body && !res.getHeader('etag') && (etag = createETag(bodyToSend, encoding))) {
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
    return
  }

  if (typeof body === 'object') {
    if (body == null) {
      res.end('')
      return
    } else if (Buffer.isBuffer(body)) {
      if (!res.getHeader('Content-Type')) res.setHeader('content-type', 'application/octet-stream')
      res.end(bodyToSend)
    } else encoding ? json(res)(bodyToSend, encoding) : json(res)(bodyToSend)
  } else {
    if (typeof bodyToSend !== 'string') bodyToSend = bodyToSend.toString()

    encoding ? res.end(bodyToSend, encoding) : res.end(bodyToSend)
  }

  return res
}
