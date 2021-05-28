import { App } from '@tinyhttp/app'
import turbo from 'turbo-http'
import { status } from '@tinyhttp/send'

const app = new App({
  applyExtensions: (_req, res, next) => {
    next()
  },
  onError: (err, req, res) => {
    status(req, res)(err.code || 500)

    res.end('Not found')
  }
})

app.get('/hello', (req, res) => res.end(`Hello World from turbo-http: ${req.originalUrl}`))

const server = turbo.createServer()

server.on('request', app.attach)

server.listen(3000, () => console.log('Server listening on http://localhost:3000'))
