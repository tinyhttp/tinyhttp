import type { Handler, NextFunction } from '@tinyhttp/router'
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
}>

export type TemplateEngineOptions = {
  [key: string]: unknown
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
  applyExtensions: (req: Request, res: Response, next: NextFunction) => void
}>
