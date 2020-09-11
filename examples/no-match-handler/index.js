import { App } from '@tinyhttp/app'

new App({
  noMatchHandler: (_req, res) => {
    res.status(404).end(`<h1>Not found</h1>`)
  },
})
  .get('/', (_, res) => void res.send('<h1>Hello World</h1>'))
  .listen(3000)
