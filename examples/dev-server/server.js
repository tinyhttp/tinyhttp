/* eslint-disable @typescript-eslint/no-var-requires */

const { App } = require('@tinyhttp/app')
const { createServer } = require('http')
const serve = require('serve-handler')
const { devSocket, html, useCtx } = require('sosse')

module.exports = async () => {
  const ctx = useCtx()
  const app = new App()

  app.get('/', (req, res) => {
    res.status(200).send(
      html({
        body: `
        <h1>Some cool page</h1>
        <h2>URL</h2>
        ${req.url}
        <h2>Params</h2>
        ${JSON.stringify(req.params, null, 2)}`,
        ctx,
      })
    )
  })

  app.use(
    async (req, res) =>
      await serve(req, res, {
        directoryListing: false,
        public: ctx.publicDir,
      })
  )

  const server = createServer(app.handler.bind(app))

  const port = 3000

  await devSocket({ server })

  return () => {
    server.listen(port)

    console.log(`Started http://localhost:${port}`)
    return () => new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())))
  }
}
