import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'
import Vue from 'vue'
import VueSSR from 'vue-server-renderer'

const createRenderer = async () =>
  VueSSR.createRenderer({
    template: await readFile('./index.template.html', 'utf-8'),
  })

const ctx = {
  title: 'Vue SSR',
  meta: `
      <meta name="keyword" content="vue,ssr">
      <meta name="description" content="vue ssr demo">
  `,
}

const server = new App()

server
  .get('*', async (req, res) => {
    const app = new Vue({
      data: {
        url: req.url,
      },
      template: `<div>The visited URL is: {{ url }}</div>`,
    })

    const renderer = await createRenderer()

    renderer.renderToString(app, ctx, (err, html) => {
      if (err) {
        res.status(500).end('Internal Server Error', () => console.log(err))
        return
      }
      res.end(html)
    })
  })
  .listen(3000)
