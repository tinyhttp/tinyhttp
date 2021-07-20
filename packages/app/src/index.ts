export { App } from './app'
export type { AppSettings, TemplateEngineOptions, TemplateFunc } from './app'
export * from './request'
import type { Request } from './request'
export * from './response'
import type { Response } from './response'
export { extendMiddleware } from './extend'
export { onErrorHandler } from './onError'
export type { ErrorHandler } from './onError'
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
