import { App } from '@tinyhttp/app'
import fs from 'fs'
import https from 'https'

const app = new App({
  settings: {
    networkExtensions: true,
  },
})

const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem'),
}

app.get('/', (req, res) => res.send(`Hello from ${req.protocol} server!`))

const server = https.createServer(options)

server.on('request', async (req, res) => await app.handler(req, res)).listen(3000)
