import { createServer } from 'http'
import path from 'path'
import rg from 'regexparam'
import { getURLParams, getRouteFromApp } from './request'
import type { Request } from './request'
import type { Response } from './response'
import type { ErrorHandler } from './onError'
import { onErrorHandler } from './onError'
import { isAsync } from './utils/async'
import { Middleware, Handler, NextFunction, Router } from '@tinyhttp/router'
import { extendMiddleware } from './extend'

export const applyHandler = (h: Handler) => async (req: Request, res: Response, next?: NextFunction) => {
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

/**
 * Function that processes the template
 */
type TemplateFunc = (path: string, locals: Record<string, any>, opts: TemplateEngineOptions, cb: (err: Error, html: unknown) => void) => void

export type TemplateEngineOptions = Partial<{
  cache: unknown
  ext: string
  renderOptions: unknown
  viewsFolder: string
  _locals: Record<string, any>
}> &
  Record<string, any>

/**
 * App class - the starting point of tinyhttp app. It's instance contains all the middleware put in it, app settings, 404 and 500 handlers and locals.
 */
export class App extends Router<App, Request, Response> {
  middleware: Middleware[] = []
  locals: Record<string, string> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings = {}
  engines: Record<string, TemplateFunc> = {}

  constructor(
    options: Partial<{
      noMatchHandler: Handler<Request, Response>
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
   * Render a template
   * @param name What to render
   * @param data data that is passed to a template
   * @param options Template engine options
   * @param cb Callback that consumes error and html
   */
  render(file: string, data: Record<string, any> = {}, cb: (err: unknown, html: unknown) => void, options: TemplateEngineOptions = {}) {
    options.viewsFolder = options.viewsFolder || `${process.cwd()}/views`
    options.ext = options.ext || file.slice(file.lastIndexOf('.') + 1) || 'ejs'
    options._locals = options._locals || {}

    let locals = { ...data, ...this.locals }

    if (options._locals) locals = { ...locals, ...options._locals }

    if (typeof file !== 'string') throw new Error('File must be a string.')

    if (!file.endsWith(`.${options.ext}`)) file = file + `.${options.ext}`

    return this.engines[options.ext](options.viewsFolder ? path.join(options.viewsFolder, file) : file, locals, options.renderOptions, cb)
  }
  /**
   * Register a template engine with extension
   */
  engine(ext: string, fn: TemplateFunc) {
    if (typeof fn !== 'function') {
      throw new Error('callback function required')
    }

    this.engines[ext] = fn

    return this
  }

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

    extendMiddleware(this)(req, res)

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
            req.route = getRouteFromApp(this, handler as Handler<Request, Response>)

            // route found, send Success 200
            res.statusCode = 200

            await applyHandler(handler as Handler<Request, Response>)(req, res, next)
          } else {
            loop(req, res)
          }
        } else {
          loop(req, res)
        }
      } else {
        if (req.url.startsWith(path)) {
          await applyHandler(handler as Handler<Request, Response>)(req, res, next)
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
