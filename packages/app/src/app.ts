import { createServer, Server } from 'node:http'
import { getURLParams } from './request.js'
import type { Request, URLParams } from './request.js'
import type { Response } from './response.js'
import type { ErrorHandler } from './onError.js'
import { onErrorHandler } from './onError.js'
import type { Middleware, Handler, NextFunction, UseMethodParams } from '@tinyhttp/router'
import { Router, pushMiddleware } from '@tinyhttp/router'
import { extendMiddleware } from './extend.js'
import { parse as rg } from 'regexparam'
import { getPathname } from '@tinyhttp/req'
import { AppConstructor, AppRenderOptions, AppSettings, TemplateEngine } from './types.js'
import { TemplateEngineOptions } from './index.js'
import { View } from './view.js'

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
export class App<Req extends Request = Request, Res extends Response = Response> extends Router<App, Req, Res> {
  middleware: Middleware<Req, Res>[] = []
  locals: Record<string, unknown> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings
  engines: Record<string, TemplateEngine> = {}
  applyExtensions: (req: Request, res: Response, next: NextFunction) => void
  attach: (req: Req, res: Res) => void
  cache: Record<string, unknown>

  constructor(options: AppConstructor<Req, Res> = {}) {
    super()
    this.onError = options?.onError || onErrorHandler
    this.noMatchHandler = options?.noMatchHandler || this.onError.bind(this, { code: 404 })
    this.settings = {
      view: View,
      xPoweredBy: true,
      views: `${process.cwd()}/views`,
      'view cache': process.env.NODE_ENV === 'production',
      ...options.settings
    }
    this.applyExtensions = options?.applyExtensions
    this.attach = (req, res) => setImmediate(this.handler.bind(this, req, res, undefined), req, res)
    this.cache = {}
  }

  /**
   * Set app setting
   * @param setting setting name
   * @param value setting value
   */
  set<K extends keyof AppSettings>(setting: K, value: AppSettings[K]): this {
    this.settings[setting] = value

    return this
  }

  /**
   * Enable app setting
   * @param setting Setting name
   */
  enable<K extends keyof AppSettings>(setting: K): this {
    this.settings[setting] = true as AppSettings[K]

    return this
  }

  /**
   * Check if setting is enabled
   * @param setting Setting name
   * @returns
   */
  enabled<K extends keyof AppSettings>(setting: K): boolean {
    return Boolean(this.settings[setting])
  }

  /**
   * Disable app setting
   * @param setting Setting name
   */
  disable<K extends keyof AppSettings>(setting: K): this {
    this.settings[setting] = false as AppSettings[K]

    return this
  }

  /**
   * Return the app's absolute pathname
   * based on the parent(s) that have
   * mounted it.
   *
   * For example if the application was
   * mounted as `"/admin"`, which itself
   * was mounted as `"/blog"` then the
   * return value would be `"/blog/admin"`.
   *
   */
  path(): string {
    return this.parent ? this.parent.path() + this.mountpath : ''
  }

  /**
   * Register a template engine with extension
   */
  engine<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    ext: string,
    fn: TemplateEngine<RenderOptions>
  ): this {
    this.engines[ext[0] === '.' ? ext : `.${ext}`] = fn

    return this
  }

  /**
   * Render a template
   * @param file What to render
   * @param data data that is passed to a template
   * @param options Template engine options
   * @param cb Callback that consumes error and html
   */
  render<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    name: string,
    data: Record<string, unknown> = {},
    options: AppRenderOptions<RenderOptions> = {} as AppRenderOptions<RenderOptions>,
    cb: (err: unknown, html?: unknown) => void
  ): void {
    let view: View | undefined

    const { _locals, ...opts } = options

    let locals = this.locals

    if (_locals) locals = { ...locals, ..._locals }

    locals = { ...locals, ...data }

    if (opts.cache == null) (opts.cache as boolean) = this.enabled('view cache')

    if (opts.cache) {
      view = this.cache[name] as View
    }

    if (!view) {
      const View = this.settings['view']
      view = new View(name, {
        defaultEngine: this.settings['view engine'],
        root: this.settings.views,
        engines: this.engines
      })

      if (!view.path) {
        const dirs =
          Array.isArray(view.root) && view.root.length > 1
            ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"'
            : 'directory "' + view.root + '"'
        const err = new Error('Failed to lookup view "' + name + '" in views ' + dirs)

        return cb(err)
      }

      if (opts.cache) {
        this.cache[name] = view
      }
    }

    try {
      view.render(opts, locals, cb)
    } catch (err) {
      cb(err)
    }
  }
  use(...args: UseMethodParams<Req, Res, App>): this {
    const base = args[0]

    const fns = args.slice(1).flat()

    let pathArray = []
    if (typeof base === 'function' || base instanceof App) {
      fns.unshift(base)
    } else {
      // if base is not an array of paths, then convert it to an array.
      let basePaths = []
      if (Array.isArray(base)) basePaths = [...base]
      else if (typeof base === 'string') basePaths = [base]

      basePaths = basePaths.filter((element) => {
        if (typeof element === 'string') {
          pathArray.push(element)
          return false
        }
        return true
      })
      fns.unshift(...basePaths)
    }
    pathArray = pathArray.length ? pathArray : ['/']

    const mountpath = pathArray.join(', ')
    let regex: { keys: string[]; pattern: RegExp }

    for (const fn of fns) {
      if (fn instanceof App) {
        pathArray.forEach((path) => {
          regex = rg(path, true)
          fn.mountpath = mountpath
          this.apps[path] = fn
          fn.parent = this
        })
      }
    }
    pathArray.forEach((path) => {
      const handlerPaths = []
      const handlerFunctions = []
      const handlerPathBase = path === '/' ? '' : lead(path)
      for (const fn of fns) {
        if (fn instanceof App && fn.middleware?.length) {
          for (const mw of fn.middleware) {
            handlerPaths.push(handlerPathBase + lead(mw.path))
            handlerFunctions.push(fn)
          }
        } else {
          handlerPaths.push('')
          handlerFunctions.push(fn)
        }
      }
      pushMiddleware(this.middleware)({
        path,
        regex,
        type: 'mw',
        handler: mount(handlerFunctions[0] as Handler),
        handlers: handlerFunctions.slice(1).map(mount),
        fullPaths: handlerPaths
      })
    })
    return this
  }

  route(path: string): App {
    const app = new App({ settings: this.settings })

    this.use(path, app)

    return app
  }

  #find(url: string): Middleware<Req, Res>[] {
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
  handler<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    req: Req,
    res: Res,
    next?: NextFunction
  ): void {
    /* Set X-Powered-By header */
    const { xPoweredBy } = this.settings
    if (xPoweredBy) res.setHeader('X-Powered-By', typeof xPoweredBy === 'string' ? xPoweredBy : 'tinyhttp')

    const exts = this.applyExtensions || extendMiddleware<RenderOptions>(this)

    req.originalUrl = req.originalUrl || req.url

    const pathname = getPathname(req.url)

    const matched = this.#find(pathname)

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

      let params: URLParams

      try {
        params = regex ? getURLParams(regex, pathname) : {}
      } catch (e) {
        if (e instanceof URIError) return res.sendStatus(400) // Handle malformed URI
        return res.sendStatus(500)
      }

      req.params = { ...req.params, ...params }

      if (path.includes(':')) {
        const first = Object.values(params)[0]
        const url = req.url.slice(req.url.indexOf(first) + first?.length)
        req.url = lead(url)
      } else {
        req.url = lead(req.url.substring(path.length))
      }

      if (!req.path) req.path = getPathname(req.url)

      if (this.settings?.enableReqRoute) req.route = mw

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
  listen(port?: number, cb?: () => void, host?: string): Server {
    return createServer().on('request', this.attach).listen(port, host, cb)
  }
}
