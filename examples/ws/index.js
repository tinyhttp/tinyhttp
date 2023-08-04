import { App } from '@tinyhttp/app'
import { tinyws } from 'tinyws'

const app = new App()

app.use(tinyws())

let connections = []

app.use('/chat', async (req) => {
  if (req.ws) {
    const ws = await req.ws()

    connections.push(ws)

    ws.on('message', (message) => {
      console.log('Received message:', message.toString())

      // broadcast
      connections.forEach((socket) => socket.send(message))
    })

    ws.on('close', () => (connections = connections.filter((conn) => (conn === ws ? false : true))))
  }
})

app.listen(3000)
