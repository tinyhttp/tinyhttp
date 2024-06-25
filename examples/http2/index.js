import { App } from '@tinyhttp/app'
import fs from 'node:fs'
import { createSecureServer } from 'node:http2'

const app = new App()

const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
}

app.get('/', (req, res) => void res.send(`Hello from HTTP ${req.httpVersion} server!`))

createSecureServer(options, (req, res) => {
  app.attach(req, res)
}).listen(3000)
