import { METHODS } from 'http'
import { Request } from './request'
import { Response } from './response'
import { App } from './app'

export type NextFunction = (err?: any) => void | undefined

export type SyncHandler = (req: Request, res: Response, next?: NextFunction) => void

export type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>

export type Handler = AsyncHandler | SyncHandler

export type ErrorHandler = (err: any, req: Request, res: Response, next?: NextFunction) => void

type Method =
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

type MiddlewareType = 'mw' | 'route'
export interface Middleware {
  method?: Method
  handler: Handler
  path?: string
  type: MiddlewareType
}

type MethodHandler = {
  path?: string | Handler
  handler?: Handler
  type: MiddlewareType
}

const createMiddlewareFromRoute = ({
  path,
  handler,
  method,
}: MethodHandler & {
  method?: Method
}) => ({
  method,
  handler: handler || (path as Handler),
  path: typeof path === 'string' ? path : '/',
})

const pushMiddleware = (mw: Middleware[]) => ({
  path,
  handler,
  method,
  handlers,
  type,
}: MethodHandler & {
  method?: Method
  handlers?: Handler[]
}) => {
  const m = createMiddlewareFromRoute({ path, handler, method, type })

  const waresFromHandlers: { handler: Handler }[] = handlers.map((handler) =>
    createMiddlewareFromRoute({
      path,
      handler,
      method,
      type,
    })
  )

  for (const mdw of [m, ...waresFromHandlers]) {
    mw.push({ ...mdw, type })
  }

  console.log(mw)
}
/**
 * tinyhttp Router. Manages middleware and has HTTP methods aliases, e.g. `app.get`, `app.put`
 */
export class Router {
  middleware: Middleware[]
  mountpath = '/'
  apps: Record<string, App> = {}

  get(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'GET',
      type: 'route',
    })

    return this
  }
  post(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'POST',
      type: 'route',
    })
    return this
  }
  put(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'PUT',
      type: 'route',
    })
    return this
  }
  patch(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'PATCH',
      type: 'route',
    })
    return this
  }
  head(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'HEAD',
      type: 'route',
    })
    return this
  }
  delete(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'DELETE',
      type: 'route',
    })
    return this
  }
  options(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'OPTIONS',
      type: 'route',
    })
    return this
  }
  checkout(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'CHECKOUT',
      type: 'route',
    })
    return this
  }
  copy(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'COPY',
      type: 'route',
    })
    return this
  }
  lock(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'LOCK',
      type: 'route',
    })
    return this
  }
  unlock(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'LOCK',
      type: 'route',
    })
    return this
  }
  merge(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'MERGE',
      type: 'route',
    })
    return this
  }
  mkactivity(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'MKACTIVITY',
      type: 'route',
    })
    return this
  }
  mkcol(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'MKCOL',
      type: 'route',
    })
    return this
  }
  move(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'MOVE',
      type: 'route',
    })
    return this
  }
  search(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'SEARCH',
      type: 'route',
    })
    return this
  }
  msearch(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'M-SEARCH',
      type: 'route',
    })
    return this
  }
  notify(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'NOTIFY',
      type: 'route',
    })
    return this
  }
  purge(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'PURGE',
      type: 'route',
    })
    return this
  }
  report(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'REPORT',
      type: 'route',
    })
    return this
  }
  subscribe(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'SUBSCRIBE',
      type: 'route',
    })
    return this
  }
  unsubscribe(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'UNSUBSCRIBE',
      type: 'route',
    })
    return this
  }
  trace(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'TRACE',
      type: 'route',
    })
    return this
  }
  acl(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'ACL',
      type: 'route',
    })
    return this
  }
  connect(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'CONNECT',
      type: 'route',
    })
    return this
  }
  bind(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'BIND',
      type: 'route',
    })
    return this
  }
  unbind(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'UNBIND',
      type: 'route',
    })
    return this
  }
  rebind(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'REBIND',
      type: 'route',
    })
    return this
  }
  link(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'LINK',
      type: 'route',
    })
    return this
  }
  unlink(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'UNLINK',
      type: 'route',
    })
    return this
  }
  mkcalendar(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'MKCALENDAR',
      type: 'route',
    })
    return this
  }
  propfind(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'PROPFIND',
      type: 'route',
    })
    return this
  }
  proppatch(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'PROPPATCH',
      type: 'route',
    })
    return this
  }
  source(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({
      path,
      handler,
      handlers,
      method: 'SOURCE',
      type: 'route',
    })
    return this
  }
  all(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    for (const method of METHODS) {
      pushMiddleware(this.middleware)({
        path,
        handler,
        method,
        handlers,
        type: 'route',
      })
    }
    return this
  }
  /**
   * Push middleware to the stack
   * @param path path that middleware will handle if request URL starts with it
   * @param handler handler function
   * @param handlers the rest handler functions
   */
  use(path: string | Handler, handler?: Handler | App, ...handlers: Handler[]) {
    if (handler instanceof Router && typeof path === 'string') {
      console.log(`⚠️ sub-app support is experimental`)
      handler.mountpath = path
      this.apps[path] = handler
    } else if (!(handler instanceof Router)) {
      pushMiddleware(this.middleware)({
        path,
        handler: typeof path === 'string' ? handler : path,
        handlers,
        type: 'mw',
      })
    }

    return this
  }
}
