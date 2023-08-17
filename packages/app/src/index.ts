export { App } from './app.js'
export * from './request.js'
export * from './response.js'
export { extendMiddleware } from './extend.js'
export { onErrorHandler, type ErrorHandler } from './onError.js'
export { View } from './view.js'

export type { AppSettings, TemplateEngineOptions, TemplateEngine, AppConstructor } from './types.js'

import type { Request } from './request.js'
import type { Response } from './response.js'
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
