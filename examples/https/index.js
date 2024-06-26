import fs from 'node:fs'
import https from 'node:https'
import { App } from '@tinyhttp/app'

const app = new App({
  settings: {
    networkExtensions: true
  }
})

const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
}

app.get('/', (req, res) => res.send(`Hello from ${req.protocol} server!`))

const server = https.createServer(options)

server.on('request', app.attach).listen(3000)
