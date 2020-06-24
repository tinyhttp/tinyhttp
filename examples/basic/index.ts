import { App } from '@tinyhttp/app'
import staticFolder from '@tinyhttp/static'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`${JSON.stringify(req.params, null, 2)}`)
  })
  .use(logger())
  .use(staticFolder())
  .listen(3000)
