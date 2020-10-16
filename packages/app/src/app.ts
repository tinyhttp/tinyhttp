import { createServer } from 'http'
import path from 'path'
import { parse } from 'url'
import { getRouteFromApp, getURLParams } from './request'
import type { Request } from './request'
import type { Response } from './response'
import type { ErrorHandler } from './onError'
import { onErrorHandler } from './onError'
import { isAsync } from './utils/async'
import { Middleware, Handler, NextFunction, Router } from '@tinyhttp/router'
import { extendMiddleware } from './extend'
import { matchParams } from '@tinyhttp/req'

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
  subdomainOffset: number
  bindAppToReqRes: boolean
  xPoweredBy: boolean
}>

/**
 * Function that processes the template
 */
export type TemplateFunc<O> = (path: string, locals: Record<string, any>, opts: TemplateEngineOptions<O>, cb: (err: Error, html: unknown) => void) => void

export type TemplateEngineOptions<O = any> = Partial<{
  cache: boolean
  ext: string
  renderOptions: O
  viewsFolder: string
  _locals: Record<string, any>
}> &
  Record<string, any>

/**
 * `App` class - the starting point of tinyhttp app.
 *
 * With the `App` you can:
 * * use routing methods and `.use(...)`
 * * set no match (404) and error (500) handlers
 * * configure template engines
 * * store data in locals
 * * listen the http server on a specified port
 *
 * In case you use TypeScript, you can pass custom types to this class because it is also a generic class.
 *
 * The first generic argument is template engine options type, usually taken from engine typings.
 *
 * First and third are `Request` and `Response` objects, respectively. Both extend the tinyhttp's `Request` and `Response` so you can add custom properties without pain.
 *
 * Example:
 *
 * ```ts
 * interface CoolReq extends Request {
 *  genericsAreDope: boolean
 * }
 *
 * const app = App<any, CoolReq, Response>()
 * ```
 */
export class App<RenderOptions = any, Req extends Request = Request, Res extends Response = Response> extends Router<App, Request, Response> {
  middleware: Middleware[] = []
  locals: Record<string, string> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings = {}
  engines: Record<string, TemplateFunc<RenderOptions>> = {}

  constructor(
    options: Partial<{
      noMatchHandler: Handler<Req, Res>
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
   * Set app setting
   * @param setting setting name
   * @param value setting value
   */
  set(setting: string, value: any) {
    this.settings[setting] = value
  }

  /**
   * Enable app setting
   * @param setting Setting name
   */
  enable(setting: string) {
    this.settings[setting] = true
  }

  /**
   * Disable app setting
   * @param setting
   */
  disable(setting: string) {
    this.settings[setting] = false
  }

  /**
   * Render a template
   * @param file What to render
   * @param data data that is passed to a template
   * @param options Template engine options
   * @param cb Callback that consumes error and html
   */
  render(file: string, data: Record<string, any> = {}, cb: (err: unknown, html: unknown) => void, options: TemplateEngineOptions<RenderOptions> = {}) {
    options.viewsFolder = options.viewsFolder || `${process.cwd()}/views`
    options.ext = options.ext || file.slice(file.lastIndexOf('.') + 1) || 'ejs'

    options._locals = options._locals || {}

    options.cache = options.cache || process.env.NODE_ENV === 'production'

    let locals = { ...data, ...this.locals }

    if (options._locals) locals = { ...locals, ...options._locals }

    if (typeof file !== 'string') throw new Error('File must be a string.')

    if (!file.endsWith(`.${options.ext}`)) file = file + `.${options.ext}`

    const dest = options.viewsFolder ? path.join(options.viewsFolder, file) : file

    const engine = this.engines[options.ext]

    const result = engine(dest, locals, options.renderOptions, cb)

    return result
  }
  /**
   * Register a template engine with extension
   */
  engine(ext: string, fn: TemplateFunc<RenderOptions>) {
    if (typeof fn !== 'function') {
      throw new Error('callback function required')
    }

    this.engines[ext] = fn

    return this
  }

  /**
   * Extends Req / Res objects, pushes 404 and 500 handlers, dispatches middleware
   * @param req Req object
   * @param res Res object
   */
  async handler(req: Req, res: Res) {
    /* Set X-Powered-By header */
    if (this.settings?.xPoweredBy) res.setHeader('X-Powered-By', 'tinyhttp')

    const mw = this.middleware

    const subappPath = Object.keys(this.apps).find((x) => req.url.startsWith(x))

    if (subappPath) {
      const app = this.apps[subappPath]

      app.handler(req, res)
    }

    const noMatchMW: Middleware = {
      handler: this.noMatchHandler,
      type: 'mw',
      path: '/',
    }

    mw.push(noMatchMW)

    let idx = 0
    const len = mw.length - 1

    const nextWithReqAndRes = (req: Req, res: Res) => (err: any) => {
      if (err) {
        this.onError(err, req, res)
      } else {
        loop(req, res)
      }
    }

    const handle = (mw: Middleware) => async (req: Req, res: Res, next?: NextFunction) => {
      const { path, method, handler, type } = mw

      extendMiddleware(this)(req, res, next)

      const parsedUrl = parse(req.url)

      req.path = parsedUrl.pathname

      if (type === 'route') {
        if (req.method === method) {
          // strip query parameters for req.params

          if (matchParams(path, parsedUrl.pathname)) {
            req.params = getURLParams(req.url, path)
            req.route = getRouteFromApp(this, handler as Handler<Req, Res>)

            // route found, send Success 200
            res.statusCode = 200

            await applyHandler(handler as Handler<Req, Res>)(req, res, next)
          } else {
            loop(req, res)
          }
        } else {
          loop(req, res)
        }
      } else {
        if (req.url.startsWith(path)) {
          await applyHandler(handler as Handler<Req, Res>)(req, res, next)
        } else {
          loop(req, res)
        }
      }
    }

    const loop = (req: Req, res: Res) => {
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
  listen(port?: number, cb?: () => void, host = '0.0.0.0') {
    const server = createServer()

    server.on('request', (req, res) => this.handler(req, res))

    return server.listen(port, host, cb)
  }
}
