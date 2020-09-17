import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'
import render from 'preact-render-to-string'
import preact from 'htm/preact/index.js'

const { html } = preact

const app = new App()

const PreactApp = ({ page }) => (page ? html`<h1>You visited ${page}</h1>` : html`<h1>Hello World</h1>`)

app
  .get('/htm.js', async (req, res) => {
    const preactFile = await readFile(`${process.cwd()}/node_modules/htm/preact/standalone.module.js`)

    res.set('Content-Type', 'text/javascript').send(preactFile.toString())
  })
  .get('/app.js', async (_req, res) => {
    const clientJS = await readFile(`${process.cwd()}/app.js`)
    res.set('Content-Type', 'text/javascript').send(clientJS.toString())
  })
  .get('/:page?', (req, res) => {
    const renderered = render(html`<${PreactApp} page=${req.params.page} />`)

    res.send(`<!DOCTYPE html>
  <html lang="en">
    <body>
      <div id="app">${renderered}</div>
      <script src="app.js" type="module"></script>
    </body>
  </html>
  `)
  })
  .listen(3000, () => console.log('Running on http://localhost:3000'))
