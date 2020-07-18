import { App } from '@tinyhttp/app'
import fs from 'fs'
import http2 from 'http2'

const app = new App()

const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem'),
}

http2.createSecureServer(options, app).listen(3000)
