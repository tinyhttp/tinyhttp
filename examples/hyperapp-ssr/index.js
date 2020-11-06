import { App } from '@tinyhttp/app'
import { h, text } from 'hyperapp'
import { renderToStream } from 'hyperapp-render'

const state = {
  text: 'Hello World!',
}

const view = (state) => h('main', {}, [h('h1', {}, [text(state.text)])])

const app = new App()

app
  .get((_, res) => {
    res.set('Content-Type', 'text/html')
    renderToStream(view(state)).pipe(res)
  })
  .listen(3000, () => console.log(`Listening on http://localhost:3000`))
