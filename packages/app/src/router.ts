import { METHODS } from 'http'
import { Request } from './request'
import { Response } from './response'

export type NextFunction = (err?: any) => void

export type SyncHandler = (req: Request, res: Response, next?: NextFunction) => void

export type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>

export type Handler = AsyncHandler | SyncHandler

export type Method = typeof METHODS[number]

type MiddlewareType = 'mw' | 'route'
export interface Middleware {
  method?: Method
  handler: Handler
  url?: string
  type: MiddlewareType
}

type MethodHandler = {
  url?: string | Handler
  handler?: Handler
  type: MiddlewareType
}

const createMiddlewareFromRoute = ({
  url,
  handler,
  method
}: MethodHandler & {
  method?: Method
}) => ({
  method,
  handler: handler || (url as Handler),
  url: typeof url === 'string' ? url : '/'
})

const pushMiddleware = (mw: Middleware[]) => ({
  url,
  handler,
  method,
  handlers,
  type
}: MethodHandler & {
  method?: Method
  handlers?: Handler[]
}) => {
  const m = createMiddlewareFromRoute({ url, handler, method, type })

  const waresFromHandlers: { handler: Handler }[] = handlers.map(handler => ({ handler }))

  for (const mdw of [m, ...waresFromHandlers]) {
    mw.push({ ...mdw, type })
  }
}

export class Router {
  middleware: Middleware[]

  get(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'GET', type: 'route' })

    return this
  }
  post(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'POST', type: 'route' })
    return this
  }
  put(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'PUT', type: 'route' })
    return this
  }
  patch(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'PATCH', type: 'route' })
    return this
  }
  head(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'HEAD', type: 'route' })
    return this
  }
  all(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    for (const method of METHODS) {
      pushMiddleware(this.middleware)({ url, handler, handlers, method, type: 'route' })
    }
    return this
  }
  use(handler: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url: '/', handler, handlers, type: 'mw' })
    return this
  }
}
