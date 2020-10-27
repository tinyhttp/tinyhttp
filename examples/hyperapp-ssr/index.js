import { App } from '@tinyhttp/app'
import { h, text } from 'hyperapp'
import { renderToString } from 'hyperapp-render'

const state = {
  text: 'Hello',
}

const actions = {
  setText: (state, event) => ({
    ...state,
    text: event.target.value,
  }),
}

const view = (state) => h('main', {}, [h('h1', {}, [text(state.text)]), h('input', { value: 'bruh' })])

const app = new App()

app
  .get((_, res) => {
    const html = renderToString(view(state))

    console.log(html)

    res.send(html)
  })
  .listen(3000, () => console.log(`Listening on http://localhost:3000`))
