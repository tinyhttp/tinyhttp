import type { Server } from 'node:http'
/* c8 ignore start*/
import type { Trust } from '@tinyhttp/proxy-addr'
import type { Handler, NextFunction, RouterInterface, UseMethodParams } from '@tinyhttp/router'
import type { ErrorHandler } from './onError.js'
import type { Request } from './request.js'
import type { Response } from './response.js'
import type { View } from './view.js'

/**
 * tinyhttp App has a few settings for toggling features
 */
export type AppSettings = Partial<{
  networkExtensions: boolean
  subdomainOffset: number
  bindAppToReqRes: boolean
  xPoweredBy: string | boolean
  enableReqRoute: boolean
  views: string | string[]
  view: typeof View
  'view cache': boolean
  'view engine': string
  'trust proxy': Trust
}>

export type TemplateEngineOptions = {
  [key: string]: unknown
  cache: boolean
}

/**
 * Function that processes the template
 */
export type TemplateEngine<O extends TemplateEngineOptions = TemplateEngineOptions> = (
  path: string,
  locals: Record<string, unknown>,
  opts: AppRenderOptions<O>,
  cb: (err: Error | null, html: unknown) => void
) => void

export type AppRenderOptions<O extends TemplateEngineOptions = TemplateEngineOptions> = O &
  Partial<{
    cache: boolean
    ext: string
    viewsFolder: string
    _locals: Record<string, unknown>
  }>

export type AppConstructor<Req extends Request = Request, Res extends Response = Response> = Partial<{
  noMatchHandler: Handler<Req, Res>
  onError: ErrorHandler
  settings: AppSettings
  applyExtensions: Handler<Req, Res>
  new (options: AppConstructor<Req, Res>): AppInterface<Req, Res>
}>

export interface AppInterface<Req extends Request, Res extends Response>
  extends RouterInterface<AppInterface<Req, Res>, Req, Res> {
  set<K extends keyof AppSettings>(setting: K, value: AppSettings[K]): AppInterface<Req, Res>

  /**
   * Enable app setting
   * @param setting Setting name
   */
  enable<K extends keyof AppSettings>(setting: K): AppInterface<Req, Res>

  /**
   * Check if setting is enabled
   * @param setting Setting name
   * @returns
   */
  enabled<K extends keyof AppSettings>(setting: K): boolean

  /**
   * Disable app setting
   * @param setting Setting name
   */
  disable<K extends keyof AppSettings>(setting: K): AppInterface<Req, Res>

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
  path(): string

  /**
   * Register a template engine with extension
   */
  engine<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    ext: string,
    fn: TemplateEngine<RenderOptions>
  ): AppInterface<Req, Res>

  /**
   * Render a template
   * @param name What to render
   * @param data data that is passed to a template
   * @param options Template engine options
   * @param cb Callback that consumes error and html
   */
  render<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions>(
    name: string,
    data: Record<string, unknown>,
    options: AppRenderOptions<RenderOptions>,
    cb: (err: unknown, html?: unknown) => void
  ): void

  use(...args: UseMethodParams<Req, Res, AppInterface<any, any>>): AppInterface<Req, Res>

  route(path: string): AppInterface<Req, Res>

  /**
   * Extends Req / Res objects, pushes 404 and 500 handlers, dispatches middleware
   * @param req Req object
   * @param res Res object
   * @param next 'Next' function
   */
  handler(req: Req, res: Res, next?: NextFunction): void

  /**
   * Creates HTTP server and dispatches middleware
   * @param port server listening port
   * @param cb callback to be invoked after server starts listening
   * @param host server listening host
   */
  listen(port?: number, cb?: () => void, host?: string): Server
}
