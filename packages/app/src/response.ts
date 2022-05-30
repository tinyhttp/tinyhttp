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
      data,
      (err: unknown, html: unknown) => {
        if (err) throw err
        res.send(html)
      },
      options
    )
    return res
  }

export interface Response<O = any> extends ServerResponse {
  header(field: string | Record<string, unknown>, val?: string | any[]): Response
  set(field: string | Record<string, unknown>, val?: string | any[]): Response
  get(field: string): string | number | string[]
  send(body: unknown): Response
  sendFile(path: string, options?: ReadStreamOptions, cb?: (err?: any) => void): Response
  json(body: unknown): Response
  status(status: number): Response
  sendStatus(statusCode: number): Response
  cookie(
    name: string,
    value: string | Record<string, unknown>,
    options?: SerializeOptions & Partial<{ signed: boolean }>
  ): Response
  clearCookie(name: string, options?: SerializeOptions): Response
  location(url: string): Response
  links(links: { [key: string]: string }): Response
  render(file: string, data?: Record<string, any>, options?: TemplateEngineOptions<O>): Response
  vary(field: string): Response
  format(obj: FormatProps): Response
  redirect(url: string, status?: number): Response
  type(type: string): Response
  download(path: string, filename: string, options?: DownloadOptions, cb?: (err?: any) => void): Response
  attachment(filename?: string): Response
  app?: App
  locals?: Record<string, any>
  /**
   * Send JSON response with JSONP callback support.
   *
   * To enable this method, install the `@tinyhttp/jsonp` package and attach the method to `res.jsonp` property.
   *
   * @param obj Response object
   */
  jsonp(obj: any): Response

  append(field: string, value: any): Response
}
