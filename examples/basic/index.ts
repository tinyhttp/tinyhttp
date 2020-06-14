import { App } from '@tinyhttp/app'
import staticFolder from '@tinyhttp/static'
import logger from '@tinyhttp/logger'

const app = new App()

app.all('/', (_, res) => res.send('<h1>Hello World</h1>'))

app.get('/:first/:second', (req, res) => {
  res.json({ URLParams: req.params, QueryParams: req.query })
})

app.use(staticFolder())

app.use(logger())

app.listen(3000)
