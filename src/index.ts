import { createServer } from 'http'
import Request from './classes/request'
import Response from './classes/response'
import notFound from './helpers/notFound'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD']

export type Handler = (req: Request, res: Response) => void | Promise<void>

declare interface Middleware {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | string
  handler: Handler
  url?: string
}

export default class App {
  routes: Middleware[]
  middleware: Middleware[]
  constructor() {
    this.routes = []
    this.middleware = []
  }
  get(url: string, handler: Handler) {
    this.routes.push({
      method: 'GET',
      handler,
      url
    })
  }
  post(url: string, handler: Handler) {
    this.routes.push({
      method: 'POST',
      handler,
      url
    })
  }
  put(url: string, handler: Handler) {
    this.routes.push({
      method: 'PUT',
      url,
      handler
    })
  }
  patch(url: string, handler: Handler) {
    this.routes.push({
      method: 'PATCH',
      url,
      handler
    })
  }
  head(url: string, handler: Handler) {
    this.routes.push({
      method: 'HEAD',
      url,
      handler
    })
  }
  all(url: string, handler: Handler) {
    for (const method of METHODS) {
      this.routes.push({
        method,
        url,
        handler
      })
    }
  }

  use(handler: Handler) {
    this.middleware.push({
      handler
    })
  }
  listen(
    port: number,
    cb = () => console.log(`Started on http://${host}:${port} 🚀`),
    host: string = 'localhost',
    backlog?: number
  ) {
    // @ts-ignore
    createServer((req: Request, res: Response) => {
      this.routes.map(({ url, method, handler }) => {
        if (url === req.url && req.method === method) {
          res.statusCode = 200
          handler(req, res)
        } else {
        }
      })

      const middleware: Middleware[] = [
        {
          handler: (req, res) => {
            if (!res.finished) {
              notFound()(req, res)
            }
          }
        },
        ...this.middleware
      ]

      middleware?.map(({ handler }) => handler(req, res))
    }).listen(port, host, backlog, cb)
  }
}
