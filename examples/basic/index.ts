import { App } from '../../packages/app/src/index'
import staticFolder from '../../packages/static/src/index'
import logger from '../../packages/logger/src/index'

const app = new App({
  noMatchHandler: (_req, res) => {
    res.status(404)
    res.write(`<h1>404</h1>`)
    res.write(`<h2>Not found</h2>`)
    res.end(':(')
  }
})

app.get('/', (_, res) => void res.send('<h1>Hello World</h1>'))

app.get('/page/:page/', (req, res) => {
  res.status(200).send(`
    <h1>Some cool page</h1>
    <h2>URL</h2>
    ${req.url}
    <h2>Params</h2>
    ${JSON.stringify(req.params, null, 2)}
`)
})

app.use(logger()).use(staticFolder())

app.listen(3000)
