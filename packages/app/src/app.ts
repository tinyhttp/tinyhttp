import { createServer } from 'http'
import rg from 'regexparam'
import { Request, getURLParams, getRouteFromApp } from './request'
import { Response } from './response'
import { onErrorHandler } from './onError'
import { isAsync } from './utils/async'
import { Middleware, Handler, NextFunction, Router, ErrorHandler } from './router'
import { extendMiddleware } from './extend'
import { View } from './view'

export const applyHandler = (h: Handler) => async (req: Request, res: Response, next?: NextFunction) => {
  // console.log(h)
  if (isAsync(h)) {
    await h(req, res, next)
  } else {
    h(req, res, next)
  }
}
/**
 * tinyhttp App has a few settings for toggling features
 */
export type AppSettings = Partial<{
  networkExtensions: boolean
  freshnessTesting: boolean
}>

type anyFunc = (...args: any[]) => any

/**
 * App class - the starting point of tinyhttp app. It's instance contains all the middleware put in it, app settings, 404 and 500 handlers and locals.
 */
export class App extends Router {
  middleware: Middleware[] = []
  locals: Record<string, string> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings = {}
  engines: Record<string, anyFunc>
  constructor(
    options: Partial<{
      noMatchHandler: Handler
      onError: ErrorHandler
      settings: AppSettings
    }> = {}
  ) {
    super()
    this.onError = options?.onError || onErrorHandler
    this.noMatchHandler = options?.noMatchHandler || this.onError.bind(null, { code: 404 })
    this.settings = options.settings
  }

  /**
   * Register a template engine with extension
   */
  engine(ext: string, fn: anyFunc) {
    if (typeof fn !== 'function') {
      throw new Error('callback function required')
    }

    const extension = ext[0] !== '.' ? '.' + ext : ext

    this.engines[extension] = fn

    return this
  }

  /*   render(name: string, options: Record<string, any> | anyFunc, cb: anyFunc) {
    const engines = this.engines

    let done: anyFunc
    let opts: Record<string, any> = options
    let renderOptions: Record<string, any> = { ...this.locals }

    if (typeof options === 'function') {
      done = options as anyFunc
      opts = {}
    } else {
      renderOptions = { ...renderOptions, ...opts }
    }

    if (opts._locals) renderOptions = { ...opts._locals }
  } */

  /**
   * Extends Request / Response objects, pushes 404 and 500 handlers, dispatches middleware
   * @param req Request object
   * @param res Response object
   */
  async handler(req: Request, res: Response) {
    const mw = this.middleware

    const subappPath = Object.keys(this.apps).find((x) => req.url.startsWith(x))

    if (subappPath) {
      const app = this.apps[subappPath]

      app.handler(req, res)
    }

    extendMiddleware(this.settings)(req, res)

    const noMatchMW: Middleware = {
      handler: this.noMatchHandler,
      type: 'mw',
      path: '/',
    }

    mw.push(noMatchMW)

    let idx = 0
    const len = mw.length - 1

    const nextWithReqAndRes = (req: Request, res: Response) => (err: any) => {
      if (err) {
        this.onError(err, req, res)
      } else {
        loop(req, res)
      }
    }

    const handle = (mw: Middleware) => async (req: Request, res: Response, next?: NextFunction) => {
      const { path, method, handler, type } = mw

      if (type === 'route') {
        if (req.method === method) {
          // strip query parameters for req.params
          const queryParamStart = req.url.lastIndexOf('?')
          const reqUrlWithoutParams = req.url.slice(0, queryParamStart === -1 ? req.url.length : queryParamStart)

          if (rg(path).pattern.test(reqUrlWithoutParams)) {
            req.params = getURLParams(req.url, path)
            req.route = getRouteFromApp(this, handler as Handler)

            // route found, send Success 200
            res.statusCode = 200

            await applyHandler(handler as Handler)(req, res, next)
          } else {
            loop(req, res)
          }
        } else {
          loop(req, res)
        }
      } else {
        if (req.url.startsWith(path)) {
          await applyHandler(handler as Handler)(req, res, next)
        } else {
          loop(req, res)
        }
      }
    }

    const loop = (req: Request, res: Response) => {
      if (res.writableEnded) return
      else if (idx <= len) {
        handle(mw[idx++])(req, res, nextWithReqAndRes(req, res))
      } else {
        return
      }
    }

    loop(req, res)
  }

  /**
   * Creates HTTP server and dispatches middleware
   * @param port server listening port
   * @param Server callback after server starts listening
   * @param host server listening host
   */
  listen(port?: number, cb?: () => void, host = 'localhost') {
    const server = createServer()

    server.on('request', (req, res) => this.handler(req, res))

    return server.listen(port, host, cb)
  }
}
