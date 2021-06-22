import { createBodySub, createParameterSubs, body, parameters } from './schema'
import { App, Request, Response, NextFunction, Middleware } from '@tinyhttp/app'
import { Handler, AsyncHandler } from '@tinyhttp/router'

type SwaggerHandler = (Handler | AsyncHandler) & { schema: any }

export function addToDocs(schema: parameters & { body?: body }) {
  const mw = async (_req: Request, _res: Response, next: NextFunction) => {
    next()
  }
  mw.schema = schema
  return mw
}

export function generateDocs(app: App) {
  const routes = app.middleware
    .filter(mw => mw.type == 'route' && (mw.handler as SwaggerHandler).schema)
    .map(route => {
      return {
        path: ((route as Middleware).path as string).replace(
          /:(?<param>[A-Za-z0-9_]+)/g,
          '{$<param>}'
        ),
        schema: (route.handler as SwaggerHandler).schema,
        method: route.method,
      }
    })

  const uniquePathsSet = new Set(routes.map(r => r.path))
  const uniquePaths = Array.from(uniquePathsSet.keys()) as string[]
  const docs = uniquePaths.map(path => {
    const merged = routes
      .filter(route => route.path == path)
      .map(route => {
        const tmp: { [_: string]: any } = {}
        tmp[path] = {}
        tmp[path][(route.method as string).toLowerCase()] = {
          parameters: createParameterSubs({
            headers: route.schema.headers,
            params: route.schema.params,
            query: route.schema.query,
          }),
          requestBody: createBodySub(route.schema.body),
        }
        return tmp
      })
    return merged
  })

  return docs
}
