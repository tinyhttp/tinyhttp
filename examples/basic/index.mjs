import { App } from '@tinyhttp/app'
import { staticHandler } from '@tinyhttp/static'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .get('/', (_, res) => void res.send('<h1>Hello World</h1>'))
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`
    <h1>Some cool page</h1>
    <h2>URL</h2>
    ${req.url}
    <h2>Params</h2>
    ${JSON.stringify(req.params, null, 2)}
  `)
  })
  .use(logger())
  .use(staticHandler('./'))
  .listen(3000)
