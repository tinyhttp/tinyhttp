import { App } from '@tinyhttp/app'
import { h, text } from 'hyperapp'
import { renderToString } from 'hyperapp-render'

const state = {
  text: 'Hello'
}

const actions = {
  setText: (state, event) => ({
    ...state,
    text: event.target.value
  })
}

const view = (state) =>
  h('main', {}, [
    h('h1', {}, [text(state.text)]),
    h('input', {
      value: state.text,
      onchange: actions.setText
    })
  ])

const app = new App()

app
  .get('/hyperapp.js', (_, res) => {
    res.sendFile(`${process.cwd()}/node_modules/hyperapp/index.js`)
  })
  .get('/app.js', async (_, res) => {
    res.sendFile(`${process.cwd()}/app.js`)
  })
  .get((_, res) => {
    const prerendered = renderToString(view(state))

    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hyperapp + tinyhttp SSR demo</title>
</head>
<body>

  <div id="app">
  ${prerendered}
  </div>
  <script type="module" src="/app.js"></script>
</body>
</html>
    `)
  })
  .listen(3000, () => console.log('Listening on http://localhost:3000'))
