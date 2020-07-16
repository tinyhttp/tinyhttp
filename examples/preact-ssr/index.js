import { App } from '@tinyhttp/app'
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

app.get('/:page?', (req, res) => {
  let renderered = render(html`<${PreactApp} page=${req.params.page} />`)

  res.send(`<!DOCTYPE html><html><body>${renderered}</body></html>`)
})

app.listen(3000, () => console.log('Running on http://localhost:3000'))
