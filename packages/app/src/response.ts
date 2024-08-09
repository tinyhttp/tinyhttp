import type { OutgoingHttpHeaders, ServerResponse } from 'node:http'
import type { SerializeOptions } from '@tinyhttp/cookie'
import type { DownloadOptions, FormatProps, ReadStreamOptions, getResponseHeader } from '@tinyhttp/res'
import type { App } from './app.js'
import type { Request } from './request.js'
import type { AppRenderOptions, TemplateEngineOptions } from './types.js'

export const renderTemplate =
  <O extends TemplateEngineOptions = TemplateEngineOptions>(_req: Request, res: Response, app: App) =>
  (file: string, data?: Record<string, unknown>, options?: AppRenderOptions<O>): Response => {
    app.render(file, data ? { ...res.locals, ...data } : res.locals, options, (err: unknown, html: unknown) => {
      if (err) throw err
      res.send(html)
    })
    return res
  }

export interface Response<B = unknown> extends ServerResponse {
  header(field: string | Record<string, unknown>, val?: string | any[]): Response<B>
  set<HeaderName extends string>(field: HeaderName, val: OutgoingHttpHeaders[HeaderName]): Response<B>
  set(fields: OutgoingHttpHeaders): Response<B>
  get<HeaderName extends string>(field: HeaderName): OutgoingHttpHeaders[HeaderName]
  send(body: B): Response<B>
  sendFile(path: string, options?: ReadStreamOptions, cb?: (err?: unknown) => void): Response<B>
  json(body: B): Response<B>
  status(status: number): Response<B>
  sendStatus(statusCode: number): Response<B>
  cookie(
    name: string,
    value: string | Record<string, unknown>,
    options?: SerializeOptions & Partial<{ signed: boolean }>
  ): Response<B>
  clearCookie(name: string, options?: SerializeOptions): Response<B>
  location(url: string): Response<B>
  links(links: { [key: string]: string }): Response<B>
  render<O extends TemplateEngineOptions = TemplateEngineOptions>(
    file: string,
    data?: Record<string, any>,
    options?: AppRenderOptions<O>
  ): Response<B>
  vary(field: string): Response<B>
  format(obj: FormatProps): Response<B>
  redirect(url: string, status?: number): Response<B>
  type(type: string): Response<B>
  download(path: string, filename: string, options?: DownloadOptions, cb?: (err?: unknown) => void): Response<B>
  attachment(filename?: string): Response<B>
  app?: App
  locals: Record<string, any>
  /**
   * Send JSON response with JSONP callback support.
   *
   * To enable this method, install the `@tinyhttp/jsonp` package and attach the method to `res.jsonp` property.
   *
   * @param obj Response object
   */
  jsonp(obj: any): Response<B>

  append(field: string, value: any): Response<B>
}
