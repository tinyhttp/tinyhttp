import { createServer, Server } from 'http'
import path from 'path'
import { parse } from 'url'
import { getURLParams } from './request'
import type { Request } from './request'
import type { Response } from './response'
import type { ErrorHandler } from './onError'
import { onErrorHandler } from './onError'
import { Middleware, Handler, NextFunction, Router, UseMethodParams } from '@tinyhttp/router'
import { extendMiddleware } from './extend'
import rg from 'regexparam'

/**
 * Add leading slash if not present (e.g. path -> /path, /path -> /path)
 * @param x
 */
const lead = (x: string) => (x.charCodeAt(0) === 47 ? x : '/' + x)

const mount = (fn: App | Handler) => (fn instanceof App ? fn.attach : fn)

export const applyHandler = <Req, Res>(h: Handler<Req, Res>) => async (req: Req, res: Res, next?: NextFunction) => {
  try {
    if (h[Symbol.toStringTag] === 'AsyncFunction') {
      await h(req, res, next)
    } else h(req, res, next)
  } catch (e) {
    next(e)
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
  xPoweredBy: string | boolean
  enableReqRoute: boolean
}>

/**
 * Function that processes the template
 */
export type TemplateFunc<O> = (
  path: string,
  locals: Record<string, any>,
  opts: TemplateEngineOptions<O>,
  cb: (err: Error, html: unknown) => void
) => void

export type TemplateEngineOptions<O = any> = Partial<{
  cache: boolean
  ext: string
  renderOptions: Partial<O>
  viewsFolder: string
  _locals: Record<string, any>
}>

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
export class App<
  RenderOptions = any,
  Req extends Request = Request,
  Res extends Response<RenderOptions> = Response<RenderOptions>
> extends Router<App, Req, Res> {
  middleware: Middleware<Req, Res>[] = []
  locals: Record<string, string> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings
  engines: Record<string, TemplateFunc<RenderOptions>> = {}
  applyExtensions: (req: Request, res: Response, next: NextFunction) => void
  attach: (req: Req, res: Res) => void

  constructor(
    options: Partial<{
      noMatchHandler: Handler<Req, Res>
      onError: ErrorHandler
      settings: AppSettings
      applyExtensions: (req: Request, res: Response, next: NextFunction) => void
    }> = {}
  ) {
    super()
    this.onError = options?.onError || onErrorHandler
    this.noMatchHandler = options?.noMatchHandler || this.onError.bind(null, { code: 404 })
    this.settings = options.settings || { xPoweredBy: true }
    this.applyExtensions = options?.applyExtensions
    this.attach = (req, res) => setImmediate(this.handler.bind(this, req, res, undefined), req, res)
  }
  /**
   * Set app setting
   * @param setting setting name
   * @param value setting value
   */
  set(setting: string, value: any) {
    this.settings[setting] = value

    return this
  }

  /**
   * Enable app setting
   * @param setting Setting name
   */
  enable(setting: string) {
    this.settings[setting] = true

    return this
  }

  /**
   * Disable app setting
   * @param setting
   */
  disable(setting: string) {
    this.settings[setting] = false

    return this
  }

  /**
   * Render a template
   * @param file What to render
   * @param data data that is passed to a template
   * @param options Template engine options
   * @param cb Callback that consumes error and html
   */
  render(
    file: string,
    data: Record<string, any> = {},
    cb: (err: unknown, html: unknown) => void,
    options: TemplateEngineOptions<RenderOptions> = {}
  ) {
    options.viewsFolder = options.viewsFolder || `${process.cwd()}/views`
    options.ext = options.ext || file.slice(file.lastIndexOf('.') + 1) || 'ejs'

    options._locals = options._locals || {}

    options.cache = options.cache || process.env.NODE_ENV === 'production'

    let locals = { ...data, ...this.locals }

    if (options._locals) locals = { ...locals, ...options._locals }

    if (!file.endsWith(`.${options.ext}`)) file = `${file}.${options.ext}`

    const dest = options.viewsFolder ? path.join(options.viewsFolder, file) : file

    this.engines[options.ext](dest, locals, options.renderOptions, cb)

    return this
  }
  use(...args: UseMethodParams<Req, Res, App>) {
    const base = args[0]

    const fns = args.slice(1)

    if (base === '/') {
      for (const fn of fns) {
        if (Array.isArray(fn)) {
          super.use(base, fn.map(mount))
        } else {
          super.use(base, fns.map(mount))
        }
      }
    } else if (typeof base === 'function' || base instanceof App) {
      super.use('/', [base, ...fns].map(mount))
    } else if (fns.some((fn) => fn instanceof App)) {
      super.use(
        base,
        fns.map((fn: App) => {
          if (fn instanceof App) {
            fn.mountpath = typeof base === 'string' ? base : '/'
            fn.parent = this
          }

          return mount(fn)
        })
      )
    } else super.use(...args)

    return this // chainable
  }
  /**
   * Register a template engine with extension
   */
  engine(ext: string, fn: TemplateFunc<RenderOptions>) {
    this.engines[ext] = fn

    return this
  }

  find(url: string, method: string) {
    return this.middleware.filter((m) => {
      m.regex = m.type === 'mw' ? rg(m.path, true) : rg(m.path)

      return (m.method ? m.method === method : true) && m.regex.pattern.test(url)
    })
  }

  /**
   * Extends Req / Res objects, pushes 404 and 500 handlers, dispatches middleware
   * @param req Req object
   * @param res Res object
   */
  handler(req: Req, res: Res, next?: NextFunction) {
    /* Set X-Powered-By header */
    const { xPoweredBy } = this.settings
    if (xPoweredBy) res.setHeader('X-Powered-By', typeof xPoweredBy === 'string' ? xPoweredBy : 'tinyhttp')

    const exts = this.applyExtensions || extendMiddleware<RenderOptions>(this)

    req.originalUrl = req.url || req.originalUrl

    const { pathname } = parse(req.originalUrl)

    const mw: Middleware[] = [
      {
        handler: exts,
        type: 'mw',
        path: '/'
      },
      ...this.find(pathname, req.method),
      {
        handler: this.noMatchHandler,
        type: 'mw',
        path: '/'
      }
    ]

    const handle = (mw: Middleware) => async (req: Req, res: Res, next?: NextFunction) => {
      const { path, handler, type, regex } = mw

      req.url = lead(req.url.substring(path.length)) || '/'

      req.path = parse(req.url).pathname

      if (type === 'route') req.params = getURLParams(regex, pathname)

      await applyHandler<Req, Res>((handler as unknown) as Handler<Req, Res>)(req, res, next)
    }

    let idx = 0

    const loop = () => res.writableEnded || (idx < mw.length && handle(mw[idx++])(req, res, next))

    next = next || ((err) => (err ? this.onError(err, req, res) : loop()))

    loop()
  }

  /**
   * Creates HTTP server and dispatches middleware
   * @param port server listening port
   * @param Server callback after server starts listening
   * @param host server listening host
   */
  listen(port?: number, cb?: () => void, host = '0.0.0.0'): Server {
    return createServer().on('request', this.attach).listen(port, host, cb)
  }
}
