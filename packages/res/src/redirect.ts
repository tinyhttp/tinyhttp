import { IncomingMessage as I, ServerResponse as S, STATUS_CODES } from 'http'
import escapeHtml from 'escape-html'
import { formatResponse } from './format'
import { setLocationHeader } from './headers'
import type { next } from './format'

export const redirect = <Request extends I = I, Response extends S = S, Next extends next = next>(req: Request, res: Response, next: Next) => (url: string, status?: number) => {
  let address = url
  status = status || 302

  let body: string

  address = setLocationHeader(req, res)(address).getHeader('Location') as string

  formatResponse(
    req,
    res,
    next
  )({
    text: () => {
      body = STATUS_CODES[status] + '. Redirecting to ' + address
    },
    html: () => {
      const u = escapeHtml(address)

      body = `<p>${STATUS_CODES[status]}. Redirecting to <a href="${u}">${u}</a></p>`
    },
    default: () => {
      body = ''
    },
  })

  res.setHeader('Content-Length', Buffer.byteLength(body))

  res.statusCode = status

  if (req.method === 'HEAD') {
    res.end()
  } else {
    res.end(body)
  }

  return res
}
