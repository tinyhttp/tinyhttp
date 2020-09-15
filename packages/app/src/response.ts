import { ServerResponse } from 'http'
import * as cookie from '@tinyhttp/cookie'
import { Request } from './request'
import { App, TemplateEngineOptions } from './app'

export * from '@tinyhttp/res'

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
  header(field: string | Record<string, unknown>, val: string | any[]): Response
  set(field: string | Record<string, unknown>, val: string | any[]): Response
  get(field: string): string | number | string[]
  send(body: unknown): Response
  json(body: unknown): Response
  status(status: number): Response
  sendStatus(statusCode: number): Response
  cookie(name: string, value: string | Record<string, unknown>, options?: cookie.SerializeOptions & Partial<{ signed: boolean }>): Response
  clearCookie(name: string, options?: cookie.SerializeOptions): Response
  location(url: string): Response
  links(links: { [key: string]: string }): Response
  render(file: string, data?: Record<string, any>, options?: TemplateEngineOptions): Response
}
