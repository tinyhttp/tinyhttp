import { createServer, STATUS_CODES } from 'http'
import rg from 'regexparam'
import {
  Request,
  getQueryParams,
  getURLParams,
  getRouteFromApp,
  getProtocol,
  getRangeFromHeader,
  checkIfXMLHttpRequest,
  getHostname,
  getRequestHeader,
  setRequestHeader
} from './request'
import { Response, send, json, status, setCookie, clearCookie, setHeader } from './response'
import { notFound } from './notFound'
import { isAsync } from './utils/async'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD']

export type Handler = (req: Request, res: Response, next?: (err?: any) => void) => void | Promise<void>

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | string

export type NextFunction = (err?: any) => void

export const onError = (err: any, _req: Request, res: Response, _next: () => void) => {
  let code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || STATUS_CODES[code])
}

export interface Middleware {
  method?: Method
  handler: Handler
  url?: string
}

type MethodHandler = {
  url: string | Handler
  handler?: Handler
}

const createHandler = ({
  url,
  handler,
  method
}: MethodHandler & {
  method: Method
}) => ({
  method,
  handler: handler || (url as Handler),
  url: typeof url === 'string' ? url : '*'
})

export class App {
  middleware: Middleware[]
  noMatchHandler: Handler
  constructor(
    options: Partial<{ noMatchHandler: Handler }> = {
      noMatchHandler: notFound()
    }
  ) {
    this.middleware = []
    this.noMatchHandler = options.noMatchHandler || this.onError.bind(null, { code: 404 })
  }

  get(url: string | Handler, handler?: Handler) {
    this.middleware.push(createHandler({ url, handler, method: 'GET' }))
    return this
  }
  post(url: string | Handler, handler?: Handler) {
    this.middleware.push(createHandler({ url, handler, method: 'POST' }))
    return this
  }
  put(url: string | Handler, handler?: Handler) {
    this.middleware.push(createHandler({ url, handler, method: 'PUT' }))
    return this
  }
  patch(url: string | Handler, handler?: Handler) {
    this.middleware.push(createHandler({ url, handler, method: 'PATCH' }))
    return this
  }
  head(url: string | Handler, handler?: Handler) {
    this.middleware.push(createHandler({ url, handler, method: 'HEAD' }))
    return this
  }
  all(url: string | Handler, handler?: Handler) {
    for (const method of METHODS) {
      this.middleware.push(createHandler({ url, handler, method }))
    }
    return this
  }
  use(handler: Handler) {
    this.middleware.push({
      handler
    })
    return this
  }
  extendMiddleware(req: Request, res: Response) {
    /// Define extensions

    /*
    Request extensions
    */

    req.app = this

    const proto = getProtocol(req)
    const secure = proto === 'https'

    req.protocol = proto
    req.secure = secure
    req.connection = Object.assign(req.socket, {
      encrypted: secure
    })

    req.query = getQueryParams(req.url)

    req.get = getRequestHeader(req)
    req.set = setRequestHeader(req)
    req.range = getRangeFromHeader(req)

    req.xhr = checkIfXMLHttpRequest(req)

    req.hostname = getHostname(req)

    /*
    Response extensions
    */
    res.app = this
    res.header = res.set = setHeader(req, res)
    res.send = send(req, res)
    res.json = json(req, res)
    res.status = status(req, res)

    res.cookie = setCookie(req, res)
    res.clearCookie = clearCookie(req, res)
  }

  onError(err, _req: Request, res: Response, _next) {
    let code = (res.statusCode = err.code || err.status || 500)
    if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
    else res.end(err.message || STATUS_CODES[code])
  }

  handle(mw: Middleware) {
    const { url, method, handler } = mw

    return async (req: Request, res: Response, next?: NextFunction) => {
      if (!res.writableEnded) {
        if (method && req.method === method) {
          if (url && req.url && rg(url).pattern.test(req.url)) {
            req.params = getURLParams(req.url, url)
            req.route = getRouteFromApp(this, handler)

            res.statusCode = 200

            if (isAsync(handler)) {
              await handler(req, res, next)
            } else {
              handler(req, res, next)
            }
          }
        } else {
          if (isAsync(handler)) {
            await handler(req, res, next)
          } else {
            handler(req, res, next)
          }
        }
      }
    }
  }

  async handler(mw: Middleware[] | [], req: Request, res: Response) {
    if (mw.length === 0) return

    this.extendMiddleware(req, res)

    const m = mw[0]
    const rest = mw.slice(1, mw.length)

    // skip handling if only one middleware
    // TODO: Implement next(err) function properly
    // const next = err => (err ? this.onError(err, req, res, next) : this.handler(rest, req, res))

    await this.handle(m)(req, res)

    this.handler(rest, req, res)
  }

  listen(port?: number, cb?: () => void, host: string = 'localhost', backlog?: number) {
    // @ts-ignore
    const server = createServer((req: Request, res: Response) => {
      const mw = this.middleware

      const noMatchMw = { handler: this.noMatchHandler }
      this.handler([...mw, noMatchMw], req, res)
    })

    return server.listen(port, host, backlog, cb)
  }
}
