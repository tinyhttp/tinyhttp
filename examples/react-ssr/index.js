import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'
import ReactDOMServer from 'react-dom/server.js'
import react from 'htm/react/index.js'

const { html } = react

const app = new App()

const ReactApp = ({ page }) => (page ? html`<h1>You visited ${page}</h1>` : html`<h1>Hello World</h1>`)

app
  .get('/app.js', async (_req, res) => {
    const clientJS = await readFile(`${process.cwd()}/app.js`)
    res.set('Content-Type', 'text/javascript').send(clientJS.toString())
  })
  .get('/:page?', (req, res) => {
    const renderered = ReactDOMServer.renderToString(html`<${ReactApp} page=${req.params.page} />`)

    res.send(`<!DOCTYPE html>
  <html lang="en">
    <body>
      <div id="app">${renderered}</div>
      <script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
      <script src="app.js" type="module"></script>
    </body>
  </html>
  `)
  })
  .listen(3000, () => console.log('Running on http://localhost:3000'))
