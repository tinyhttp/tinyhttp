import { App } from '@tinyhttp/app'
import fs from 'fs'
import http2 from 'http2'

const app = new App()

const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem'),
}

app.get('/', (req, res) => void res.send(`Hello from HTTP ${req.httpVersion} server!`))

http2
  .createSecureServer(options, async (req, res) => {
    // @ts-ignore
    await app.handler(req, res)
  })
  .listen(3000)
