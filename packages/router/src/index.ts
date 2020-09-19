import { METHODS, IncomingMessage as I, ServerResponse as R } from 'http'

/* HELPER TYPES */

export type NextFunction = (err?: any) => void | undefined

export type SyncHandler<Request extends I = I, Response extends R = R> = (req: Request, res: Response, next?: NextFunction) => void

export type AsyncHandler<Request extends I = I, Response extends R = R> = (req: Request, res: Response, next?: NextFunction) => Promise<void>

export type Handler<Request extends I = I, Response extends R = R> = AsyncHandler<Request, Response> | SyncHandler<Request, Response>

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'DELETE'
  | 'CHECKOUT'
  | 'COPY'
  | 'LOCK'
  | 'UNLOCK'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCOL'
  | 'MOVE'
  | 'SEARCH'
  | 'M-SEARCH'
  | 'NOTIFY'
  | 'PURGE'
  | 'REPORT'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'TRACE'
  | 'ACL'
  | 'CONNECT'
  | 'BIND'
  | 'UNBIND'
  | 'REBIND'
  | 'LINK'
  | 'UNLINK'
  | 'MKCALENDAR'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'SOURCE'
  | string

export type MiddlewareType = 'mw' | 'route'

export interface Middleware<Req extends I = I, Res extends R = R> {
  method?: Method
  handler: Handler<Req, Res>
  path?: string
  type: MiddlewareType
}

export type MethodHandler<Req extends I = I, Res extends R = R> = {
  path?: string | Handler<Req, Res>
  handler?: Handler<Req, Res>
  type: MiddlewareType
}

export type RouterHandler<Req extends I = I, Res extends R = R> = Handler<Req, Res> | Handler<Req, Res>[]

export type RouterPathOrHandler<Req extends I = I, Res extends R = R> = string | RouterHandler<Req, Res>

export type RouterMethod<Req extends I = I, Res extends R = R> = (path: string | Handler<Req, Res>, handler?: Handler<Req, Res>, ...handlers: Handler<Req, Res>[]) => any

type RouterMethodParams<Req extends I = I, Res extends R = R> = Parameters<RouterMethod<Req, Res>>

export type UseMethod<Req extends I = I, Res extends R = R, App extends Router = any> = (
  path: RouterPathOrHandler<Req, Res> | App,
  handler?: RouterHandler<Req, Res> | App,
  ...handlers: RouterHandler<Req, Res>[]
) => any

export type UseMethodParams<Req extends I = I, Res extends R = R, App extends Router = any> = Parameters<UseMethod<Req, Res, App>>

/** HELPER METHODS */

const createMiddlewareFromRoute = <Req extends I = I, Res extends R = R>({
  path,
  handler,
  method,
}: MethodHandler<Req, Res> & {
  method?: Method
}) => ({
  method,
  handler: handler || (path as Handler),
  path: typeof path === 'string' ? path : '/',
})

const pushMiddleware = <Req extends I = I, Res extends R = R>(mw: Middleware[]) => ({
  path,
  handler,
  method,
  handlers,
  type,
}: MethodHandler<Req, Res> & {
  method?: Method
  handlers?: Handler<Req, Res>[]
}) => {
  const m = createMiddlewareFromRoute<Req, Res>({ path, handler, method, type })

  let waresFromHandlers: { handler: Handler<Req, Res> }[] = []

  if (handlers) {
    waresFromHandlers = handlers.map((handler) =>
      createMiddlewareFromRoute<Req, Res>({
        path,
        handler,
        method,
        type,
      })
    )
  }

  for (const mdw of [m, ...waresFromHandlers]) {
    mw.push({ ...mdw, type })
  }
}

/**
 * tinyhttp Router. Manages middleware and has HTTP methods aliases, e.g. `app.get`, `app.put`
 */
export class Router<App extends Router = any, Req extends I = I, Res extends R = R> {
  middleware: Middleware[] = []
  mountpath = '/'
  parent: App
  apps: Record<string, App> = {}

  get(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'GET',
      type: 'route',
    })

    return this
  }
  post(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'POST',
      type: 'route',
    })
    return this
  }
  put(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'PUT',
      type: 'route',
    })
    return this
  }
  patch(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'PATCH',
      type: 'route',
    })
    return this
  }
  head(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'HEAD',
      type: 'route',
    })
    return this
  }
  delete(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'DELETE',
      type: 'route',
    })
    return this
  }
  options(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'OPTIONS',
      type: 'route',
    })
    return this
  }
  checkout(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'CHECKOUT',
      type: 'route',
    })
    return this
  }
  copy(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'COPY',
      type: 'route',
    })
    return this
  }
  lock(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'LOCK',
      type: 'route',
    })
    return this
  }
  unlock(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'LOCK',
      type: 'route',
    })
    return this
  }
  merge(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'MERGE',
      type: 'route',
    })
    return this
  }
  mkactivity(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'MKACTIVITY',
      type: 'route',
    })
    return this
  }
  mkcol(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'MKCOL',
      type: 'route',
    })
    return this
  }
  move(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'MOVE',
      type: 'route',
    })
    return this
  }
  search(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'SEARCH',
      type: 'route',
    })
    return this
  }
  msearch(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'M-SEARCH',
      type: 'route',
    })
    return this
  }
  notify(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'NOTIFY',
      type: 'route',
    })
    return this
  }
  purge(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'PURGE',
      type: 'route',
    })
    return this
  }
  report(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'REPORT',
      type: 'route',
    })
    return this
  }
  subscribe(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'SUBSCRIBE',
      type: 'route',
    })
    return this
  }
  unsubscribe(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'UNSUBSCRIBE',
      type: 'route',
    })
    return this
  }
  trace(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'TRACE',
      type: 'route',
    })
    return this
  }
  acl(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'ACL',
      type: 'route',
    })
    return this
  }
  connect(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'CONNECT',
      type: 'route',
    })
    return this
  }
  bind(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'BIND',
      type: 'route',
    })
    return this
  }
  unbind(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'UNBIND',
      type: 'route',
    })
    return this
  }
  rebind(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'REBIND',
      type: 'route',
    })
    return this
  }
  link(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'LINK',
      type: 'route',
    })
    return this
  }
  unlink(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'UNLINK',
      type: 'route',
    })
    return this
  }
  mkcalendar(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'MKCALENDAR',
      type: 'route',
    })
    return this
  }
  propfind(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'PROPFIND',
      type: 'route',
    })
    return this
  }
  proppatch(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'PROPPATCH',
      type: 'route',
    })
    return this
  }
  source(...args: RouterMethodParams<Req, Res>) {
    pushMiddleware<Req, Res>(this.middleware)({
      path: args[0],
      handler: args[1],
      handlers: args.slice(2) as Handler<Req, Res>[],
      method: 'SOURCE',
      type: 'route',
    })
    return this
  }
  all(...args: RouterMethodParams<Req, Res>) {
    for (const method of METHODS) {
      pushMiddleware(this.middleware)({
        ...args,
        method,
        type: 'route',
      })
    }
    return this
  }

  /**
   * Return the app's absolute pathname
   * based on the parent(s) that have
   * mounted it.
   *
   * For example if the application was
   * mounted as "/admin", which itself
   * was mounted as "/blog" then the
   * return value would be "/blog/admin".
   *
   */
  path(): string {
    return this.parent ? this.parent.path() + this.mountpath : ''
  }

  /**
   * Push middleware to the stack
   * @param path path that middleware will handle if request URL starts with it
   * @param handler handler function
   * @param handlers the rest handler functions
   */
  use(...args: UseMethodParams<Req, Res, App>) {
    const path = args[0]

    const handler = args[1]

    const handlers = args.slice(2).flat()

    // app.use('/subapp', subApp)
    if (typeof path === 'string' && handler instanceof Router) {
      // Set mountpath to the specified path
      handler.mountpath = path
      // Set App parent to current App
      handler.parent = this

      // Prefix paths with a mountpath
      handler.middleware.forEach((mw) => {
        const patchedPath = mw.path === '/' ? handler.mountpath : handler.mountpath + mw.path

        mw.path = patchedPath
      })
      this.apps[path] = handler
    }
    // app.use(subApp)
    else if (path instanceof Router) {
      // Set App parent to current App
      path.parent = this

      // Mount on root
      path.mountpath = '/'

      this.apps['/'] = path
    } else if (!(handler instanceof Router)) {
      let totalHandlers: Handler[] = []

      if (typeof path !== 'string') {
        if (Array.isArray(path)) {
          path.slice(1).map((h) => totalHandlers.push(h))
        }
      }

      if (handler) {
        if (Array.isArray(handler)) {
          if (typeof path === 'string') {
            handler.slice(1).map((h) => {
              totalHandlers.push(h)
            })
          } else {
            for (const h of handler) {
              totalHandlers.push(h)
            }
          }
        }
      }

      totalHandlers = totalHandlers.concat(handlers as Handler[])

      let mainHandler: Handler

      if (typeof path === 'string') {
        if (Array.isArray(handler)) {
          mainHandler = handler[0]
        } else {
          mainHandler = handler
        }
      } else {
        if (Array.isArray(path)) {
          mainHandler = path[0]
        } else {
          mainHandler = path as Handler
        }

        if (typeof handler === 'function') {
          totalHandlers.unshift(handler)
        }
      }

      pushMiddleware(this.middleware)({
        path: path as string,
        handler: mainHandler,
        handlers: totalHandlers,
        type: 'mw',
      })
    }

    return this
  }
}
