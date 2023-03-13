import { App } from '@tinyhttp/app'
import { renderToString } from 'vue/server-renderer'
import sirv from 'sirv'
import { createApp } from './app.js'

const app = new App()

app
  .use(sirv())
  .get('*', async (req, res) => {
    const app = createApp()

    const html = await renderToString(app)

    res.send(`<!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script async src="https://ga.jspm.io/npm:es-module-shims@1.7.0/dist/es-module-shims.js"></script>
        <script type="importmap">
        {
          "imports": {
            "vue": "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.41/vue.esm-browser.prod.js"
          }
        }
        </script>
        <script type="module" src="./client.js"></script>
      </body>
    </html>`)
  })
  .listen(3000)
