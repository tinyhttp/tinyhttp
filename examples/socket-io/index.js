import { App } from '@tinyhttp/app'
import { logger } from '@tinyhttp/logger'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'

const app = new App()
const server = createServer(app.handler.bind(app))
const io = new Server(server)
app
  .use(logger())
  .get('/', (_, res) => { 
    res.sendFile(`${path.resolve()}/index.html`)
  })

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  })
})

server.listen(3003, () => {
  console.log('listening on *:3003')
})
