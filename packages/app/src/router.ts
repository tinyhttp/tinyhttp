import { Middleware } from '.'
import { METHODS } from 'http'
import { Request } from './request'
import { Response } from './response'

export type NextFunction = (err?: any) => void

export type SyncHandler = (req: Request, res: Response, next?: NextFunction) => void

export type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>

export type Handler = AsyncHandler | SyncHandler

export type Method = typeof METHODS[number]

type MethodHandler = {
  url?: string | Handler
  handler?: Handler
}

const createMiddlewareFromRoute = ({
  url,
  handler,
  method
}: MethodHandler & {
  method: Method
}) => ({
  method,
  handler: handler || (url as Handler),
  url: typeof url === 'string' ? url : '*'
})

const pushMiddleware = (mw: Middleware[]) => ({
  url,
  handler,
  method,
  handlers
}: MethodHandler & {
  method: Method
  handlers?: Handler[]
}) => {
  const m = createMiddlewareFromRoute({ url, handler, method })

  const waresFromHandlers: { handler: Handler }[] = handlers.map(handler => ({ handler }))

  for (const mdw of [m, ...waresFromHandlers]) {
    mw.push(mdw)
  }
}

export class Router {
  middleware: Middleware[]

  get(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'GET' })

    return this
  }
  post(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'POST' })
    return this
  }
  put(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'PUT' })
    return this
  }
  patch(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'PATCH' })
    return this
  }
  head(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ url, handler, handlers, method: 'HEAD' })
    return this
  }
  all(url: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    for (const method of METHODS) {
      pushMiddleware(this.middleware)({ url, handler, handlers, method })
    }
    return this
  }
  use(handler: Handler, ...handlers: Handler[]) {
    this.middleware.push({
      handler
    })
    for (const h of handlers) {
      this.middleware.push({
        handler: h
      })
    }
    return this
  }
}
