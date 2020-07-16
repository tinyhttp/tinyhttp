import { createServer } from 'http'
import rg from 'regexparam'
import { Request, getURLParams, getRouteFromApp } from './request'
import { Response } from './response'
import { onErrorHandler } from './onError'
import { isAsync } from './utils/async'
import {
  Middleware,
  Handler,
  NextFunction,
  Router,
  ErrorHandler,
} from './router'
import { extendMiddleware } from './extend'

export const applyHandler = (h: Handler): Handler => async (
  req,
  res,
  next?
) => {
  if (isAsync(h)) {
    await h(req, res, next)
  } else {
    h(req, res, next)
  }
}

export type AppSettings = Partial<{
  networkExtensions: boolean
  freshnessTesting: boolean
}>

export class App extends Router {
  middleware: Middleware[]
  locals: Record<string, string>
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings
  constructor(
    options: Partial<{
      noMatchHandler: Handler
      onError: ErrorHandler
      settings: AppSettings
    }> = {}
  ) {
    super()
    this.locals = Object.create(null)
    this.middleware = []
    this.onError = options?.onError || onErrorHandler
    this.noMatchHandler = options?.noMatchHandler || this.onError({ code: 404 })
    this.settings = options.settings || {}
  }

  async handler(req: Request, res: Response) {
    const mw = this.middleware

    extendMiddleware(this.settings)(req, res)

    const noMatchMW: Middleware = {
      handler: this.noMatchHandler,
      type: 'mw',
      path: '/',
    }

    if (!mw.includes(noMatchMW)) mw.push(noMatchMW)

    let idx = 0
    const len = mw.length - 1

    const next = (err) => {
      if (err) {
        this.onError(err)(req, res)
      } else {
        loop()
      }
    }

    const handle = (mw: Middleware) => async (
      req: Request,
      res: Response,
      next?: NextFunction
    ) => {
      const { path, method, handler, type } = mw

      if (type === 'route') {
        if (req.method === method) {
          // strip query parameters for req.params
          const queryParamStart = req.url.lastIndexOf('?')
          const reqUrlWithoutParams = req.url.slice(
            0,
            queryParamStart === -1 ? req.url.length : queryParamStart
          )
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

  listen(port?: number, cb?: () => void, host = 'localhost', backlog?: number) {
    const server = createServer((req: Request, res: Response) => {
      this.handler(req, res)
    })

    return server.listen(port, host, backlog, cb)
  }
}
