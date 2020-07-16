import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'
import render from 'preact-render-to-string'
import preact from 'htm/preact/index.js'

const { html } = preact

const app = new App()

const PreactApp = ({ page }) => {
  if (page) {
    return html`<h1>You visited ${page}</h1>`
  } else {
    return html`<h1>Hello World</h1>`
  }
}

app
  .get('/app.js', async (req, res, next) => {
    const clientJS = await readFile(`${process.cwd()}/app.js`)

    res.send(clientJS.toString())
  })
  .get('/:page?', (req, res) => {
    let renderered = render(html`<${PreactApp} page=${req.params.page} />`)

    res.send(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <div id="app">${renderered}
      </div>
      <script src="app.js" type="module"></script>
    </body>
  </html>
  `)
  })
app.listen(3000, () => console.log('Running on http://localhost:3000'))
