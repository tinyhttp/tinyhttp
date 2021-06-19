import { App } from '@tinyhttp/app'
import { tinyws } from 'tinyws'

const app = new App()

app.use(tinyws())

app.use('/hmr', async (req, res) => {
  if (req.ws) {
    const ws = await req.ws()

    return ws.send('hello there')
  } else {
    res.send('Hello from HTTP!')
  }
})

app.listen(3000)
