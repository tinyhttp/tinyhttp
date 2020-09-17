import { App } from '@tinyhttp/app'

const app = new App()

app
  .get('/', function handler(_, res) {
    res.send('<h1>Hello World</h1>')
  })
  .listen(3000, () => console.log('Started on http://localhost:3000'))
