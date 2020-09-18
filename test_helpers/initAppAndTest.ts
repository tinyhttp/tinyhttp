import { App } from '../packages/app/src'
import type { Handler } from '../packages/app/src'

import { makeFetch } from 'supertest-fetch'

export const InitAppAndTest = (handler: Handler, route?: string, method = 'get', settings = {}) => {
  const app = new App(settings)

  if (route) {
    app[method.toLowerCase()](route, handler)
  } else {
    app.use(handler)
  }

  const server = app.listen()

  const fetch = makeFetch(server)

  return { fetch, app, server }
}
