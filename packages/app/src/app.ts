import { createServer } from 'http'
import rg from 'regexparam'
import { Request, getURLParams, getRouteFromApp } from './request'
import { Response } from './response'
import { onErrorHandler } from './onError'
import { isAsync } from './utils/async'
import { Middleware, Handler, NextFunction, Router, ErrorHandler } from './router'
import { extendMiddleware } from './extend'

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
  onError: ErrorHandler
  constructor(options: Partial<{ noMatchHandler: Handler; onError: ErrorHandler }> = {}) {
    super()
    this.locals = Object.create(null)
    this.middleware = []
    this.onError = options?.onError || onErrorHandler
    this.noMatchHandler = options?.noMatchHandler || this.onError.bind(null, { code: 404 })
  }

  async handler(mw: Middleware[], req: Request, res: Response) {
    extendMiddleware(this)(req, res)

    const noMatchMW: Middleware = { handler: this.noMatchHandler, type: 'mw', path: '/' }

    if (!mw.includes(noMatchMW)) mw.push(noMatchMW)

    let idx = 0
    let len = mw.length - 1

    // skip handling if only one middleware
    // TODO: Implement next(err) function properly
    const next = err => {
      if (err) {
        this.onError(err, req, res)
      } else {
        loop()
      }
    }

    const handle = (mw: Middleware) => async (req: Request, res: Response, next?: NextFunction) => {
      const { path, method, handler, type } = mw

      if (type === 'route') {
        if (req.method === method) {
          const queryParamStart = req.url.indexOf('?')
          const reqUrlWithoutParams = req.url.slice(0, queryParamStart === -1 ? req.url.length : queryParamStart)
          if (rg(path).pattern.test(reqUrlWithoutParams)) {
            req.params = getURLParams(req.url, path)
            req.route = getRouteFromApp(this, handler)

            // route found, send Success 200
            res.statusCode = 200

            applyHandler(handler)(req, res, next)
          } else {
            loop()
          }
        }
      } else {
        if (req.url.startsWith(path)) {
          applyHandler(handler)(req, res, next)
        } else {
          loop()
        }
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
