import { ServerResponse } from 'http'
import type { SerializeOptions } from '@tinyhttp/cookie'
import { Request } from './request.js'
import { App, TemplateEngineOptions } from './app.js'
import type { ReadStreamOptions, FormatProps, DownloadOptions } from '@tinyhttp/res'

export const renderTemplate =
  <O>(_req: Request, res: Response, app: App) =>
  (file: string, data?: Record<string, any>, options?: TemplateEngineOptions<O>): Response => {
    app.render(
      file,
      data ? { ...data, ...res.locals } : res.locals,
      (err: unknown, html: unknown) => {
        if (err) throw err
        res.send(html)
      },
      options
    )
    return res
  }

export interface Response<O = any, B = any> extends ServerResponse {
  header(field: string | Record<string, unknown>, val?: string | any[]): Response<O, B>
  set(field: string | Record<string, unknown>, val?: string | any[]): Response<O, B>
  get(field: string): string | number | string[]
  send(body: unknown): Response<O, B>
  sendFile(path: string, options?: ReadStreamOptions, cb?: (err?: any) => void): Response<O, B>
  json(body: unknown): Response<O, B>
  status(status: number): Response<O, B>
  sendStatus(statusCode: number): Response<O, B>
  cookie(
    name: string,
    value: string | Record<string, unknown>,
    options?: SerializeOptions & Partial<{ signed: boolean }>
  ): Response<O, B>
  clearCookie(name: string, options?: SerializeOptions): Response<O, B>
  location(url: string): Response<O, B>
  links(links: { [key: string]: string }): Response<O, B>
  render(file: string, data?: Record<string, any>, options?: TemplateEngineOptions<O>): Response<O, B>
  vary(field: string): Response<O, B>
  format(obj: FormatProps): Response<O, B>
  redirect(url: string, status?: number): Response<O, B>
  type(type: string): Response<O, B>
  download(path: string, filename: string, options?: DownloadOptions, cb?: (err?: any) => void): Response<O, B>
  attachment(filename?: string): Response<O, B>
  app?: App
  locals?: Record<string, any>
  /**
   * Send JSON response with JSONP callback support.
   *
   * To enable this method, install the `@tinyhttp/jsonp` package and attach the method to `res.jsonp` property.
   *
   * @param obj Response object
   */
  jsonp(obj: any): Response<O, B>

  append(field: string, value: any): Response<O, B>
}
