export { App } from './app.js'
export type { AppSettings, TemplateEngineOptions, TemplateEngine, AppConstructor } from './types.js'
export * from './request.js'
import type { Request } from './request.js'
export * from './response.js'
import type { Response } from './response.js'
export { extendMiddleware } from './extend.js'
export { onErrorHandler } from './onError.js'
export type { ErrorHandler } from './onError.js'
import type {
  NextFunction,
  Handler as RHandler,
  AsyncHandler as RAsyncHandler,
  SyncHandler as RSyncHandler,
  Middleware
} from '@tinyhttp/router'

export type Handler = RHandler<Request, Response>
export type AsyncHandler = RAsyncHandler<Request, Response>
export type SyncHandler = RSyncHandler<Request, Response>
export type { NextFunction, Middleware, Request, Response }
