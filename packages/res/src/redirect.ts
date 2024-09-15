import { type IncomingMessage as Req, type ServerResponse as Res, STATUS_CODES } from 'node:http'
import { formatResponse } from './format.js'
import { setLocationHeader } from './headers.js'
import { escapeHTML } from './util.js'

type next = (err?: any) => void

export const redirect =
  <Request extends Req = Req, Response extends Res = Res, Next extends next = next>(
    req: Request,
    res: Response,
    next: Next
  ) =>
  (url: string, status?: number): Response => {
    let address = url
    status = status || 302

    let body = ''

    address = setLocationHeader(req, res)(address).getHeader('Location') as string

    formatResponse(
      req,
      res,
      next
    )({
      text: () => {
        body = `${STATUS_CODES[status]}. Redirecting to ${address}`
      },
      html: () => {
        const u = escapeHTML(address)

        body = `<p>${STATUS_CODES[status]}. Redirecting to <a href="${u}">${u}</a></p>`
      },
      default: () => {
        body = ''
      }
    })

    res.setHeader('Content-Length', Buffer.byteLength(body))

    res.statusCode = status

    if (req.method === 'HEAD') res.end()
    else res.end(body)

    return res
  }
