import { App } from '../../packages/app/src/index'
import staticFolder from '../../packages/static/index'
import logger from '../../packages/logger/index'
import { parse } from 'url'

const app = new App()

app.all('/', (req, res) => {
  res.status(200).send(`
    <h1>tinyhttp example</h1>
    <ul>
      <li>Protocol: ${req.protocol}</li>
      <li>HTTPS: ${req.secure ? 'yes' : 'no'}</li>
      <li>URL: ${req.url}</li>
      <li>Method: ${req.method}</li>
      <li>Host: ${req.hostname}</li>
      <li>Status: ${res.statusCode}</li>
    </ul>
    <h2>Request headers</h2>
<pre>
${JSON.stringify(req.headers, null, 2)}
</pre>
`)
})

app.get('/:first/:second', (req, res) => {
  res.json({ URLParams: req.params, QueryParams: req.query })
})

app.use(staticFolder())

app.use(logger())

app.listen(3000)
