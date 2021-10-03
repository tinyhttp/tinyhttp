import { createServer, Server } from 'http'
import path from 'path'
import { getRouteFromApp, getURLParams } from './request'
import type { Request } from './request'
import type { Response } from './response'
import type { ErrorHandler } from './onError'
import { onErrorHandler } from './onError'
import { Middleware, Handler, NextFunction, Router, UseMethodParams, pushMiddleware } from '@tinyhttp/router'
import { extendMiddleware } from './extend'
import { parse as rg } from 'regexparam'
import { getPathname } from '@tinyhttp/req'

/**
 * Add leading slash if not present (e.g. path -> /path, /path -> /path)
 * @param x
 */
const lead = (x: string) => (x.charCodeAt(0) === 47 ? x : '/' + x)

const mount = (fn: App | Handler) => (fn instanceof App ? fn.attach : fn)

const applyHandler =
  <Req, Res>(h: Handler<Req, Res>) =>
  async (req: Req, res: Res, next?: NextFunction) => {
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

export type TemplateEngineOptions<O extends any> = Partial<{
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
  set<T = unknown>(setting: string, value: T): this {
    this.settings[setting] = value

    return this
  }

  /**
   * Enable app setting
   * @param setting Setting name
   */
  enable(setting: string): this {
    this.settings[setting] = true

    return this
  }

  /**
   * Disable app setting
   * @param setting
   */
  disable(setting: string): this {
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
    data: Record<string, unknown> = {},
    cb: (err: unknown, html: unknown) => void,
    options: TemplateEngineOptions<RenderOptions> = {}
  ): this {
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
  use(...args: UseMethodParams<Req, Res, App>): this {
    const base = args[0]

    const fns = args.slice(1).flat()

    if (base instanceof App) {
      // Set App parent to current App
      base.parent = this

      // Mount on root
      base.mountpath = '/'

      this.apps['/'] = base
    }

    const path = typeof base === 'string' ? base : '/'

    let regex: { keys: string[]; pattern: RegExp }

    for (const fn of fns) {
      if (fn instanceof App) {
        regex = rg(path, true)

        fn.mountpath = path

        this.apps[path] = fn

        fn.parent = this
      }
    }

    if (base === '/') {
      for (const fn of fns) super.use(base, mount(fn as Handler))
    } else if (typeof base === 'function' || base instanceof App) {
      super.use('/', [base, ...fns].map(mount))
    } else if (Array.isArray(base)) {
      super.use('/', [...base, ...fns].map(mount))
    } else {
      const handlerPaths = []
      const handlerFunctions = []
      for (const fn of fns) {
        if (fn instanceof App && fn.middleware?.length) {
          for (const mw of fn.middleware) {
            handlerPaths.push(lead(base as string) + lead(mw.path))
            handlerFunctions.push(fn)
          }
        } else {
          handlerPaths.push('')
          handlerFunctions.push(fn)
        }
      }
      pushMiddleware(this.middleware)({
        path: base as string,
        regex,
        type: 'mw',
        handler: mount(handlerFunctions[0] as Handler),
        handlers: handlerFunctions.slice(1).map(mount),
        fullPaths: handlerPaths
      })
    }

    return this
  }
  /**
   * Register a template engine with extension
   */
  engine(ext: string, fn: TemplateFunc<RenderOptions>): this {
    this.engines[ext] = fn

    return this
  }

  route(path: string): App {
    const app = new App()

    this.use(path, app)

    return app
  }

  find(url: string): Middleware<Req, Res>[] {
    return this.middleware.filter((m) => {
      m.regex = m.regex || rg(m.path, m.type === 'mw')

      let fullPathRegex: { keys: string[]; pattern: RegExp }

      m.fullPath && typeof m.fullPath === 'string'
        ? (fullPathRegex = rg(m.fullPath, m.type === 'mw'))
        : (fullPathRegex = null)

      return m.regex.pattern.test(url) && (m.type === 'mw' && fullPathRegex ? fullPathRegex.pattern.test(url) : true)
    })
  }

  /**
   * Extends Req / Res objects, pushes 404 and 500 handlers, dispatches middleware
   * @param req Req object
   * @param res Res object
   */
  handler(req: Req, res: Res, next?: NextFunction): void {
    /* Set X-Powered-By header */
    const { xPoweredBy } = this.settings
    if (xPoweredBy) res.setHeader('X-Powered-By', typeof xPoweredBy === 'string' ? xPoweredBy : 'tinyhttp')

    const exts = this.applyExtensions || extendMiddleware<RenderOptions>(this)

    req.originalUrl = req.url || req.originalUrl

    const pathname = getPathname(req.originalUrl)

    const matched = this.find(pathname)

    const mw: Middleware[] = [
      {
        handler: exts,
        type: 'mw',
        path: '/'
      },
      ...matched.filter((x) => req.method === 'HEAD' || (x.method ? x.method === req.method : true))
    ]

    if (matched[0] != null) {
      mw.push({
        type: 'mw',
        handler: (req, res, next) => {
          if (req.method === 'HEAD') {
            res.statusCode = 204
            return res.end('')
          }
          next()
        },
        path: '/'
      })
    }

    mw.push({
      handler: this.noMatchHandler,
      type: 'mw',
      path: '/'
    })

    const handle = (mw: Middleware) => async (req: Req, res: Res, next?: NextFunction) => {
      const { path, handler, regex } = mw

      const params = regex ? getURLParams(regex, pathname) : {}

      req.params = { ...req.params, ...params }

      if (path.includes(':')) {
        const first = Object.values(params)[0]
        const url = req.url.slice(req.url.indexOf(first) + first?.length)
        req.url = lead(url)
      } else {
        req.url = lead(req.url.substring(path.length))
      }

      if (!req.path) req.path = getPathname(req.url)

      if (this.settings?.enableReqRoute) req.route = getRouteFromApp(this as any, handler)

      await applyHandler<Req, Res>(handler as unknown as Handler<Req, Res>)(req, res, next)
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
