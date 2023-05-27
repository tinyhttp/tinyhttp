import { App } from '../packages/app/src/index'
import type { Handler } from '../packages/app/src/index'
import { FetchFunction, makeFetch } from 'supertest-fetch'
import { Server } from 'node:http'

export const InitAppAndTest = (
  handler: Handler,
  route?: string,
  method = 'get',
  settings: ConstructorParameters<typeof App>[0] = {}
): { fetch: FetchFunction; app: App; server: Server } => {
  const app = new App(settings)

  if (route) app[method.toLowerCase()](route, handler)
  else app.use(handler)

  const server = app.listen()

  const fetch = makeFetch(server)

  return { fetch, app, server }
}
