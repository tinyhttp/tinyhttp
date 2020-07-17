/* eslint-disable @typescript-eslint/no-var-requires */

const { App } = require('@tinyhttp/app')
const { createServer } = require('http')
const { devSocket, useCtx } = require('sosse')
const serve = require('serve-handler')

module.exports = async () => {
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
