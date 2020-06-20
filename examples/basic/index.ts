import { App } from '../../packages/app/src/index'
import staticFolder from '../../packages/static/index'
import logger from '../../packages/logger/index'

const app = new App()

app.get('/', (_, res) => void res.send('<h1>Hello World</h1>'))

app.all('/page/:page/', (req, res) => {
  res.status(200).send(`
    <h1>Some cool page</h1>
    <h2>URL</h2>
    ${req.url}
    <h2>Params</h2>
    ${JSON.stringify(req.params, null, 2)}
`)
})


app.use(staticFolder())

app.use(logger())

app.listen(3000)
