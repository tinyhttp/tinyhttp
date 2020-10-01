/* eslint-disable @typescript-eslint/no-var-requires */
require('svelte/register')
const fs = require('fs')
const path = require('path')
const { App } = require('@tinyhttp/app')
const AppSvelte = require('./App.svelte').default

server
  .get('*', async (req, res) => {
    const { url } = req
    const { html, head } = AppSvelte.render({
      url,
      title: 'Svelte SSR',
      htmlString: `
            <h2>This is html string</h2>
        `,
    })

    const indexFileContent = fs.readFileSync(path.resolve(__dirname, 'index.html'))

    res.send(indexFileContent.toString().replace('<div id="svelte_app"></div>', `<div id="svelte_app">${html}</div>`).replace('<head></head>', `<head>${head}</head>`))
  })
  .listen(3000)
