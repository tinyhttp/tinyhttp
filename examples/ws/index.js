import { App } from '@tinyhttp/app'
import { tinyws } from 'tinyws'

const app = new App()

let connections = []

app.use('/chat', async (req, res) => {
  if (!req.ws) return res.send('Hello from HTTP! Connect over WebSocket to join the chat.')

  const ws = await req.ws()

  connections.push(ws)

  ws.on('message', (message) => {
    console.log('Received message:', message.toString())

    // broadcast
    connections.forEach((socket) => {
      socket.send(message)
    })
  })

  // biome-ignore lint/suspicious/noAssignInExpressions: quick example
  ws.on('close', () => (connections = connections.filter((conn) => conn !== ws)))
})

const server = app.listen(3000)

tinyws(app, server, { paths: '/chat' })
