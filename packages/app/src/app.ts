import { createServer, STATUS_CODES } from 'http'
import rg from 'regexparam'
import { Request, getURLParams, getRouteFromApp } from './request'
import { Response } from './response'
import { notFound } from './notFound'
import { isAsync } from './utils/async'
import { Middleware, Handler, NextFunction, Router } from './router'
import { extendMiddleware } from './extend'

export const onError = (err: any, _req: Request, res: Response, _next: () => void) => {
  let code = (res.statusCode = err.code || err.status || 500)
  if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
  else res.end(err.message || STATUS_CODES[code])
}

export const applyHandler = (h: Handler): Handler => async (req, res, next?) => {
  if (isAsync(h)) {
    await h(req, res, next)
  } else {
    h(req, res, next)
  }
}

export class App extends Router {
  middleware: Middleware[]
  locals: { [key: string]: string }[]
  noMatchHandler: Handler
  constructor(
    options: Partial<{ noMatchHandler: Handler }> = {
      noMatchHandler: notFound()
    }
  ) {
    super()
    this.locals = Object.create(null)
    this.middleware = []
    this.noMatchHandler = options.noMatchHandler || this.onError.bind(null, { code: 404 })
  }

  onError(err, _req: Request, res: Response, _next: NextFunction) {
    let code = (res.statusCode = err.code || err.status || 500)
    if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err)
    else res.end(err.message || STATUS_CODES[code])
  }

  async handler(mw: Middleware[], req: Request, res: Response) {
    extendMiddleware(this)(req, res)

    mw.push({ handler: this.noMatchHandler, type: 'mw', path: '/' })

    let idx = 0
    let len = mw.length - 1

    // skip handling if only one middleware
    // TODO: Implement next(err) function properly
    const next = err => {
      if (err) {
        this.onError(err, req, res, next)
      } else {
        loop()
      }
    }

    const handle = (mw: Middleware) => async (req: Request, res: Response, next?: NextFunction) => {
      const { path, method, handler } = mw

      if (method && req.method === method) {
        if (path && req.url && rg(path).pattern.test(req.url)) {
          req.params = getURLParams(req.url, path)
          req.route = getRouteFromApp(this, handler)

          // route found, send Success 200
          res.statusCode = 200

          applyHandler(handler)(req, res, next)
        }
      } else {
        applyHandler(handler)(req, res, next)
      }
    }

    if (mw.length === 1) handle(mw[0])(req, res)

    const loop = () => {
      if (!res.writableEnded) {
        if (idx < len) {
          handle(mw[idx++])(req, res, next)
        }
      }
    }

    loop()
  }

  listen(port?: number, cb?: () => void, host: string = 'localhost', backlog?: number) {
    // @ts-ignore
    const server = createServer((req: Request, res: Response) => {
      this.handler(this.middleware, req, res)
    })

    return server.listen(port, host, backlog, cb)
  }
}
