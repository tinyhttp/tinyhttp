import type { Server } from 'node:http'
import { type FetchFunction, makeFetch } from 'supertest-fetch'
import type { Handler } from '../packages/app/src/index'
import { App } from '../packages/app/src/index'

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
