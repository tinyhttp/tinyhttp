import * as Sentry from '@sentry/node'
import { App } from '@tinyhttp/app'

const app = new App({
  onError: (err, req, res, next) => {
    Sentry.expressErrorHandler()(err, req, res, next ? next : () => {})
    res.status(500).send('Internal server error')
  }
})

app.get('/', () => {
  throw new Error('Oh no, an unexpected error!')
})

app.get('/page/:page/', (req, res) => {
  Sentry.startSpan(
    {
      name: 'someCoolTask',
      op: 'cool.task'
    },
    () => {
      res.status(200).send(`
        <h1>Some cool page</h1>
        <h2>URL</h2>
        ${req.url}
        <h2>Params</h2>
        ${JSON.stringify(req.params, null, 2)}
      `)
    }
  )
})

app.listen(3000, () => console.log('Listening on http://localhost:3000'))
