/* HELPER TYPES */

export type NextFunction = (err?: any) => void

export type SyncHandler<Request extends any = any, Response extends any = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

export type AsyncHandler<Request extends any = any, Response extends any = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

export type Handler<Request extends any = any, Response extends any = any> =
  | AsyncHandler<Request, Response>
  | SyncHandler<Request, Response>

const METHODS = [
  'ACL',
  'BIND',
  'CHECKOUT',
  'CONNECT',
  'COPY',
  'DELETE',
  'GET',
  'HEAD',
  'LINK',
  'LOCK',
  'M-SEARCH',
  'MERGE',
  'MKACTIVITY',
  'MKCALENDAR',
  'MKCOL',
  'MOVE',
  'NOTIFY',
  'OPTIONS',
  'PATCH',
  'POST',
  'PRI',
  'PROPFIND',
  'PROPPATCH',
  'PURGE',
  'PUT',
  'REBIND',
  'REPORT',
  'SEARCH',
  'SOURCE',
  'SUBSCRIBE',
  'TRACE',
  'UNBIND',
  'UNLINK',
  'UNLOCK',
  'UNSUBSCRIBE'
] as const

export type Method = typeof METHODS[number]

export type MiddlewareType = 'mw' | 'route'

type RegexParams = {
  keys: string[]
  pattern: RegExp
}

type RIM<Req, Res, App> = (...args: RouterMethodParams<Req, Res>) => App

export interface Middleware<Req extends any = any, Res extends any = any> {
  method?: Method
  handler: Handler<Req, Res>
  path?: string
  type: MiddlewareType
  regex?: RegexParams
}

export type MethodHandler<Req extends any = any, Res extends any = any> = {
  path?: string | Handler<Req, Res>
  handler?: Handler<Req, Res>
  type: MiddlewareType
  regex?: RegexParams
  fullPath?: string
}

export type RouterHandler<Req extends any = any, Res extends any = any> = Handler<Req, Res> | Handler<Req, Res>[]

export type RouterPathOrHandler<Req extends any = any, Res extends any = any> = string | RouterHandler<Req, Res>

export type RouterMethod<Req extends any = any, Res extends any = any> = (
  path: string | Handler<Req, Res>,
  handler?: RouterHandler<Req, Res>,
  ...handlers: RouterHandler<Req, Res>[]
) => any

type RouterMethodParams<Req extends any = any, Res extends any = any> = Parameters<RouterMethod<Req, Res>>

export type UseMethod<Req extends any = any, Res extends any = any, App extends Router = any> = (
  path: RouterPathOrHandler<Req, Res> | App,
  handler?: RouterHandler<Req, Res> | App,
  ...handlers: RouterHandler<Req, Res>[]
) => any

export type UseMethodParams<Req extends any = any, Res extends any = any, App extends Router = any> = Parameters<
  UseMethod<Req, Res, App>
>

/** HELPER METHODS */

const createMiddlewareFromRoute = <Req extends any = any, Res extends any = any>({
  path,
  handler,
  fullPath,
  method
}: MethodHandler<Req, Res> & {
  method?: Method
}) => ({
  method,
  handler: handler || (path as Handler),
  path: typeof path === 'string' ? path : '/',
  fullPath: typeof path === 'string' ? fullPath : path
})

/**
 * Push wares to a middleware array
 * @param mw Middleware arrays
 */
export const pushMiddleware = <Req extends any = any, Res extends any = any>(mw: Middleware[]) => ({
  path,
  handler,
  method,
  handlers,
  type,
  fullPaths
}: MethodHandler<Req, Res> & {
  method?: Method
  handlers?: RouterHandler<Req, Res>[]
  fullPaths?: string[]
}) => {
  const m = createMiddlewareFromRoute<Req, Res>({ path, handler, method, type, fullPath: fullPaths?.[0] })

  let waresFromHandlers: { handler: Handler<Req, Res> }[] = []

  if (handlers) {
    waresFromHandlers = handlers.flat().map((handler) => {
      let idx = 1
      return createMiddlewareFromRoute<Req, Res>({
        path,
        handler,
        method,
        type,
        fullPath: fullPaths == null ? null : fullPaths[idx++]
      })
    })
  }

  for (const mdw of [m, ...waresFromHandlers]) mw.push({ ...mdw, type })
}

/**
 * tinyhttp Router. Manages middleware and has HTTP methods aliases, e.g. `app.get`, `app.put`
 */
export class Router<App extends Router = any, Req extends any = any, Res extends any = any> {
  middleware: Middleware[] = []
  mountpath = '/'
  parent: App
  apps: Record<string, App> = {}

  acl: RIM<Req, Res, this>
  bind: RIM<Req, Res, this>
  checkout: RIM<Req, Res, this>
  connect: RIM<Req, Res, this>
  copy: RIM<Req, Res, this>
  delete: RIM<Req, Res, this>
  get: RIM<Req, Res, this>
  head: RIM<Req, Res, this>
  link: RIM<Req, Res, this>
  lock: RIM<Req, Res, this>
  merge: RIM<Req, Res, this>
  mkactivity: RIM<Req, Res, this>
  mkcalendar: RIM<Req, Res, this>
  mkcol: RIM<Req, Res, this>
  move: RIM<Req, Res, this>
  notify: RIM<Req, Res, this>
  options: RIM<Req, Res, this>
  patch: RIM<Req, Res, this>
  post: RIM<Req, Res, this>
  pri: RIM<Req, Res, this>
  propfind: RIM<Req, Res, this>
  proppatch: RIM<Req, Res, this>
  purge: RIM<Req, Res, this>
  put: RIM<Req, Res, this>
  rebind: RIM<Req, Res, this>
  report: RIM<Req, Res, this>
  search: RIM<Req, Res, this>
  source: RIM<Req, Res, this>
  subscribe: RIM<Req, Res, this>
  trace: RIM<Req, Res, this>
  unbind: RIM<Req, Res, this>
  unlink: RIM<Req, Res, this>
  unlock: RIM<Req, Res, this>
  unsubscribe: RIM<Req, Res, this>

  constructor() {
    for (const m of METHODS) {
      this[m.toLowerCase()] = this.add(m as Method)
    }
  }

  add(method: Method) {
    return (...args: RouterMethodParams<Req, Res>) => {
      const handlers = args.slice(1).flat() as Handler<Req, Res>[]
      pushMiddleware<Req, Res>(this.middleware)({
        path: args[0],
        handler: handlers[0],
        handlers: handlers.slice(1),
        method,
        type: 'route'
      })

      return this
    }
  }

  msearch(...args: RouterMethodParams<Req, Res>) {
    const handlers = args.slice(1).flat() as Handler<Req, Res>[]

    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: handlers[0],
      handlers: handlers.slice(1),
      method: 'M-SEARCH',
      type: 'route'
    })

    return this
  }

  all(...args: RouterMethodParams<Req, Res>) {
    const handlers = args.slice(1).flat() as Handler<Req, Res>[]

    pushMiddleware(this.middleware)({
      path: args[0],
      handler: handlers[0],
      handlers: handlers.slice(1),
      type: 'route'
    })

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
   * Push middleware to the stack
   */
  use(...args: UseMethodParams<Req, Res, App>) {
    const base = args[0]

    const handlers = args.slice(1).flat()

    if (typeof base === 'string') {
      pushMiddleware(this.middleware)({
        path: base,
        handler: handlers[0] as Handler,
        handlers: handlers.slice(1) as Handler[],
        type: 'mw'
      })
    } else {
      pushMiddleware(this.middleware)({
        path: '/',
        handler: Array.isArray(base) ? base[0] : (base as Handler),
        handlers: Array.isArray(base)
          ? [...(base.slice(1) as Handler[]), ...(handlers as Handler[])]
          : (handlers as Handler[]),
        type: 'mw'
      })
    }

    return this
  }
}
