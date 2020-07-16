import { App } from '@tinyhttp/app'
import { createServer } from 'http'
import { devSocket, useCtx } from 'sosse'
import serve from 'serve-handler'

export default async () => {
  const ctx = useCtx()

  const app = new App()

  app.use((req, res) =>
    serve(req, res, {
      public: ctx.publicDir,
    })
  )

  const server = createServer(app.handler)

  const port = 3000

  await devSocket({ server })

  return () => {
    server.listen(port)

    console.log(`Started http://localhost:${port}`)
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())))
  }
}
