import App from './src/index'
import logger from './src/helpers/logger'
import staticFolder from './src/helpers/static'
import Response from './src/classes/response'

const app = new App()

app.get('/:first/:second', (req, res) => {
  res.json({ query: req.query })
})

app.use(staticFolder())

app.use(logger())

app.listen(3000)
