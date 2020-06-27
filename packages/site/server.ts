import { App } from '../app/src'
import staticFolder from '../static/src'
import loggerHandler from '../logger/src'

const app = new App()

app
  .use(loggerHandler())
  .use(staticFolder('static'))
  .get('/docs/:page', async (req, res) => {
    await staticFolder('docs')(req, res)
  })

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
