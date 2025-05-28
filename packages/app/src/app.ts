import { type Server, createServer } from 'node:http'
import { getPathname } from '@tinyhttp/req'
import type { Handler, Middleware, NextFunction, UseMethodParams } from '@tinyhttp/router'
import { Router, pushMiddleware } from '@tinyhttp/router'
import { parse as rg } from 'regexparam'
import { extendMiddleware } from './extend.js'
import type { TemplateEngineOptions } from './index.js'
import type { ErrorHandler } from './onError.js'
import { onErrorHandler } from './onError.js'
import { getURLParams } from './request.js'
import type { Request, URLParams } from './request.js'
import type { Response } from './response.js'
import type { AppConstructor, AppInterface, AppRenderOptions, AppSettings, TemplateEngine } from './types.js'
import { View } from './view.js'

/**
 * Add leading slash if not present (e.g. path -> /path, /path -> /path)
 * @param x
 */
const lead = (x: string) => (x.charCodeAt(0) === 47 ? x : `/${x}`)

const trail = (x: string) => (x.charCodeAt(x.length - 1) === 47 ? x.substring(0, x.length - 1) : x)

const mount = (fn: App | Handler) => (fn instanceof App ? fn.attach : fn)

const applyHandler =
  <Req, Res>(h: Handler<Req, Res>) =>
  async (req: Req, res: Res, next: NextFunction) => {
    try {
      if (h[Symbol.toStringTag] === 'AsyncFunction') {
        await h(req, res, next)
      } else h(req, res, next)
    } catch (e) {
      next?.(e)
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

export class App<Req extends Request = Request, Res extends Response = Response>
  extends Router<App, Req, Res>
  implements AppInterface<Req, Res>
{
  middleware: Middleware<Req, Res>[] = []
  locals: Record<string, unknown> = {}
  noMatchHandler: Handler
  onError: ErrorHandler
  settings: AppSettings
  engines: Record<string, TemplateEngine> = {}
  applyExtensions?: Handler
  attach: (req: Req, res: Res, next?: NextFunction) => void
  cache: Record<string, unknown>

  constructor(options: AppConstructor<Req, Res> = {}) {
    super()
    this.onError = options?.onError || onErrorHandler
    // @ts-expect-error typescript is not smart enough to understand "this" ts(2345)
    this.noMatchHandler = options?.noMatchHandler || this.onError.bind(this, { code: 404 })
    this.settings = {
      view: View,
      xPoweredBy: true,
      views: `${process.cwd()}/views`,
      'view cache': process.env.NODE_ENV === 'production',
      'trust proxy': 0,
      ...options.settings
    }
    if (options.applyExtensions) this.applyExtensions = options?.applyExtensions
    const boundHandler = this.handler.bind(this)
    this.attach = (req, res, next?: NextFunction) => setImmediate(boundHandler, req, res, next)
    this.cache = {}
  }

  set<K extends keyof AppSettings>(setting: K, value: AppSettings[K]): this {
    this.settings[setting] = value

    return this
  }

  enable<K extends keyof AppSettings>(setting: K): this {
    this.settings[setting] = true as AppSettings[K]

    return this
  }

  enabled<K extends keyof AppSettings>(setting: K) {
    return Boolean(this.settings[setting])
  }

  disable<K extends keyof AppSettings>(setting: K): this {
    this.settings[setting] = false as AppSettings[K]

    return this
  }

  path() {
    return this.parent ? this.parent.path() + this.mountpath : ''
  }

  engine<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    ext: string,
    fn: TemplateEngine<RenderOptions>
  ): this {
    this.engines[ext[0] === '.' ? ext : `.${ext}`] = fn as TemplateEngine
    return this
  }

  render<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    name: string,
    data: Record<string, unknown> = {},
    options: AppRenderOptions<RenderOptions> = {} as AppRenderOptions<RenderOptions>,
    cb: (err: unknown, html?: unknown) => void = () => {}
  ) {
    let view: View | undefined

    const { _locals, ...opts } = options

    let locals = this.locals

    if (_locals) locals = { ...locals, ..._locals }

    locals = { ...locals, ...data }

    if (opts.cache == null) opts.cache = this.enabled('view cache')

    if (opts.cache) {
      view = this.cache[name] as View
    }

    if (!view) {
      const ViewClass = this.settings.view || View

      try {
        view = new ViewClass(name, {
          defaultEngine: this.settings['view engine'],
          root: this.settings.views,
          engines: this.engines
        })
      } catch (err) {
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
  use(...args: UseMethodParams<Req, Res, AppInterface<any, any>>): this {
    const base = args[0]

    const fns = args.slice(1).flat()

    let pathArray: string[] = []
    if (typeof base === 'function' || base instanceof App) {
      fns.unshift(base)
    } else {
      // if base is not an array of paths, then convert it to an array.
      let basePaths: string[] = []
      if (Array.isArray(base)) basePaths = base as string[]
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
    pathArray = pathArray.length ? pathArray.map((path) => lead(path)) : ['/']

    const mountpath = pathArray.join(', ')
    let regex!: { keys: string[]; pattern: RegExp }

    for (const fn of fns) {
      if (fn instanceof App) {
        for (const path of pathArray) {
          regex = rg(path, true)
          fn.mountpath = mountpath
          this.apps[path] = fn
          // @ts-expect-error typescript is not smart enough to understand "this" ts(2345)
          fn.parent = this
        }
      }
    }
    for (const path of pathArray) {
      const handlerPaths: string[] = []
      const handlerFunctions: App[] = []
      const handlerPathBase = path === '/' ? '' : lead(path)
      for (const fn of fns) {
        if (fn instanceof App && fn.middleware?.length) {
          for (const mw of fn.middleware) {
            handlerPaths.push(handlerPathBase + lead(mw.path as string))
            handlerFunctions.push(fn)
          }
        } else {
          handlerPaths.push('')
          handlerFunctions.push(fn as App)
        }
      }
      pushMiddleware(this.middleware)({
        path,
        regex,
        type: 'mw',
        handler: mount(handlerFunctions[0]),
        handlers: handlerFunctions.slice(1).map(mount),
        fullPaths: handlerPaths
      })
    }

    return this
  }

  route(path: string): App<any, any> {
    const app = new App({ settings: this.settings })

    this.use(path, app)

    return app
  }

  #find(url: string): Middleware<Req, Res>[] {
    const result: Middleware<Req, Res>[] = []

    for (let i = 0; i < this.middleware.length; i++) {
      const m = this.middleware[i]

      if (!m.regex) {
        m.regex = rg(m.path as string, m.type === 'mw')
      }

      if (!m.regex.pattern.test(url)) {
        continue
      }

      if (m.type === 'mw' && m.fullPath && typeof m.fullPath === 'string') {
        if (!m.fullPathRegex) {
          m.fullPathRegex = rg(m.fullPath, true)
        }

        if (!m.fullPathRegex.pattern.test(url)) {
          continue
        }
      }

      result.push(m)
    }

    return result
  }

  handler<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    req: Req,
    res: Res,
    next?: NextFunction
  ) {
    /* Set X-Powered-By header */
    const { xPoweredBy } = this.settings
    if (xPoweredBy) res.setHeader('X-Powered-By', typeof xPoweredBy === 'string' ? xPoweredBy : 'tinyhttp')
    // @ts-expect-error typescript is not smart enough to understand "this" ts(2345)
    const exts = this.applyExtensions || extendMiddleware<RenderOptions>(this)

    const mw: Middleware[] = [
      {
        handler: exts,
        type: 'mw',
        path: '/'
      }
    ]

    req.baseUrl = ''

    const handle = (mw: Middleware, pathname: string) => async (req: Req, res: Res, next: NextFunction) => {
      const { path, handler, regex } = mw

      let params: URLParams

      try {
        params = regex ? getURLParams(regex, pathname) : {}
      } catch (e) {
        console.error(e)
        if (e instanceof URIError) return res.sendStatus(400)
        throw e
      }

      let prefix = path as string
      if (regex) {
        for (const key of regex.keys as string[]) {
          if (key === 'wild') {
            prefix = prefix.replace('*', params.wild)
          } else {
            prefix = prefix.replace(`:${key}`, params[key])
          }
        }
      }

      req.params = { ...req.params, ...params }

      if (mw.type === 'mw') {
        req.url = lead(req.originalUrl.substring(prefix.length))
        req.baseUrl = trail(req.originalUrl.substring(0, prefix.length))
      }

      if (!req.path) req.path = pathname

      if (this.settings?.enableReqRoute) req.route = mw

      await applyHandler<Req, Res>(handler as unknown as Handler<Req, Res>)(req, res, next)
    }

    let idx = 0

    const loop = () => {
      req.originalUrl = req.baseUrl + req.url
      const pathname = getPathname(req.url)
      const matched = this.#find(pathname).filter(
        (x: Middleware) => (req.method === 'HEAD' || (x.method ? x.method === req.method : true)) && !mw.includes(x)
      )

      if (matched.length && matched[0] !== null) {
        if (idx !== 0) {
          idx = mw.length
          req.params = {}
        }
        mw.push(...matched)
        mw.push({
          type: 'mw',
          handler: (req, res, next) => {
            if (req.method === 'HEAD') {
              res.statusCode = 204
              return res.end('')
            }
            next?.()
          },
          path: '/'
        })
      } else if (this.parent == null) {
        mw.push({
          handler: this.noMatchHandler,
          type: 'route',
          path: '/'
        })
      }

      void handle(mw[idx++], pathname)(req, res, next as NextFunction)
    }

    const parentNext = next
    next = (err) => {
      if (err != null) {
        // @ts-expect-error The 'this' context of type 'this' is not assignable to method's 'this' of type 'App<Request, Response<unknown>>' ts(2345)
        return this.onError(err, req, res)
      }

      if (res.writableEnded) return
      if (idx >= mw.length) {
        if (parentNext != null) parentNext()
        return
      }

      loop()
    }

    loop()
  }

  listen(port?: number, cb?: () => void, host?: string) {
    return createServer().on('request', this.attach).listen(port, host, cb)
  }
}
