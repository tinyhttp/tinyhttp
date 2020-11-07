/* eslint-disable @typescript-eslint/no-var-requires */

const next = require('next')
const { App } = require('@tinyhttp/app')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = new App()

  server.get('/', (req, res) => app.render(req, res, '/', req.query))

  server.get('/about', (req, res) => app.render(req, res, '/about', req.query))

  server.get('/blog/:slug', (req, res) => app.render(req, res, '/blog/:slug', req.query))

  server.all('*', (req, res) => handle(req, res))

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('Started on http://localhost:3000')
  })
})
