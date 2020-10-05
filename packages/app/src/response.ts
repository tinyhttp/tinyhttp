import { ServerResponse } from 'http'
import * as cookie from '@tinyhttp/cookie'
import { Request } from './request'
import { App, TemplateEngineOptions } from './app'

import type { ReadStreamOptions, FormatProps, DownloadOptions } from '@tinyhttp/res'

export const renderTemplate = (_req: Request, res: Response, app: App) => (file: string, data?: Record<string, any>, options?: TemplateEngineOptions): Response => {
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

export interface Response extends ServerResponse {
  /**
   * Sets the response’s HTTP header `field` to `value`. To set multiple fields at once, pass an object as the parameter.
   * @param field HTTP header field
   * @param val HTTP header value
   */
  header(field: string | Record<string, unknown>, val: string | any[]): Response

  /**
   * Sets the response’s HTTP header `field` to `value`. To set multiple fields at once, pass an object as the parameter.
   * @param field HTTP header field
   * @param val HTTP header value
   *
   * Alias to `res.header`
   */
  set(field: string | Record<string, unknown>, val: string | any[]): Response
  get(field: string): string | number | string[]

  /**
   * Sends the HTTP response.
   *
   * The body parameter can be a Buffer object, a string, an object, or an array.
   *
   * This method performs many useful tasks for simple non-streaming responses.
   * For example, it automatically assigns the Content-Length HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.
   *
   * @param body Response body
   */
  send(body: unknown): Response

  /**
   * Sends a file by piping a stream to response.
   *
   * It also checks for extension to set a proper `Content-Type` header.
   *
   * Path argument must be absolute. To use a relative path, specify the `root` option first.
   *
   * @param path Path to file
   * @param options readable stream options (that res.sendFile uses)
   * @param cb Callback for catching errors / readable stream end
   */
  sendFile(path: string, options: ReadStreamOptions, cb: (err?: any) => void): Response

  /**
   * Send JSON response
   * @param body Response body
   */
  json(body: unknown): Response

  status(status: number): Response
  sendStatus(statusCode: number): Response
  cookie(name: string, value: string | Record<string, unknown>, options?: cookie.SerializeOptions & Partial<{ signed: boolean }>): Response
  clearCookie(name: string, options?: cookie.SerializeOptions): Response
  location(url: string): Response
  links(links: { [key: string]: string }): Response
  render(file: string, data?: Record<string, any>, options?: TemplateEngineOptions): Response
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
   * To enable this method, install the `@tinyhttp/jsonp` package and use it as shown below:
   *
   * ```js
   * import { jsonp } from '@tinyhttp/jsonp'
   * app.use((req, res, next) => {
   *  res.jsonp = jsonp(req, res, app)
   *  next()
   * })
   *
   * app.get('/', (req, res) => {
   *  res.jsonp({ some: 'jsonp' })
   * })
   * ```
   *
   * @param obj Response object
   */
  jsonp(obj: any): Response

  append(field: string, value: any): Response
}
