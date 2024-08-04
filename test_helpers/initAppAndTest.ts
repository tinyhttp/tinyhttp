import fs from 'node:fs/promises'
import type { Server } from 'node:http'
import { type Http2SecureServer, createSecureServer } from 'node:http2'
import path from 'node:path'
import { type FetchFunction, makeFetch } from 'supertest-fetch'
import { App } from '../packages/app/src/index'
import type { Handler } from '../packages/app/src/index'

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

const secureServerCredentials = {
  key: await fs.readFile(path.join(import.meta.dirname, '..', 'tests', 'fixtures', 'server.key')),
  cert: await fs.readFile(path.join(import.meta.dirname, '..', 'tests', 'fixtures', 'server.crt'))
}

export const InitSecureAppAndTest = (
  handler: Handler,
  route?: string,
  method = 'get',
  settings: ConstructorParameters<typeof App>[0] = {}
): { fetch: FetchFunction; app: App; server: Http2SecureServer } => {
  const app = new App(settings)

  if (route) app[method.toLowerCase()](route, handler)
  else app.use(handler)

  const server = createSecureServer({
    ...secureServerCredentials
  })
  server.on('request', app.attach)
  server.listen()

  const fetch = makeFetch(server)

  return { fetch, app, server }
}
