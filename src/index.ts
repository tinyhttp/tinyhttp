import { createServer } from 'http'
import rg from 'regexparam'
import Request, { getQueryParams, getURLParams } from './classes/request'
import Response, { send, json } from './classes/response'
import notFound from './helpers/notFound'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD']

export type Handler = (req: Request, res: Response) => void | Promise<void>

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | string

export interface Middleware {
  method?: Method
  handler: Handler
  url?: string
}

type MethodHandler = {
  url: string | Handler
  handler?: Handler
}

const createHandler = ({
  url,
  handler,
  method
}: MethodHandler & {
  method: Method
}) => ({
  method,
  handler: handler || (url as Handler),
  url: typeof url === 'string' ? url : '*'
})

export default class App {
  routes: Middleware[]
  middleware: Middleware[]
  constructor() {
    this.routes = []
    this.middleware = []
  }
  get(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'GET' }))
  }
  post(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'POST' }))
  }
  put(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'PUT' }))
  }
  patch(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'PATCH' }))
  }
  head(url: string | Handler, handler?: Handler) {
    this.routes.push(createHandler({ url, handler, method: 'HEAD' }))
  }
  all(url: string | Handler, handler?: Handler) {
    for (const method of METHODS) {
      this.routes.push(createHandler({ url, handler, method }))
    }
  }
  use(handler: Handler) {
    this.middleware.push({
      handler
    })
  }
  listen(
    port: number,
    cb = () => console.log(`Started on http://${host}:${port}`),
    host: string = 'localhost',
    backlog?: number
  ) {
    // @ts-ignore
    createServer((req: Request, res: Response) => {
      // Define extensions
      res.send = (body: any) => send(req, res, body)
      res.json = (body: any) => json(req, res, body)

      req.query = getQueryParams(req.url)

      this.routes.map(({ url, method, handler }) => {
        if (req.method === method) {
          if (url && req.url && rg(url).pattern.test(req.url)) {
            req.params = getURLParams(req.url, url)
            if (!res.writableEnded) {
              res.statusCode = 200
              handler(req, res)
            }
          }
        }
      })

      let middleware: Middleware[] = this.middleware.filter(m => m.handler.name !== 'logger')

      middleware.push({ handler: notFound() })

      const logger = this.middleware.find(m => m.handler.name === 'logger')

      if (logger) middleware.push(logger)

      middleware.map(({ handler }) => {
        handler(req, res)
      })
    }).listen(port, host, backlog, cb)
  }
}
