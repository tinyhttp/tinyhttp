import { readdirSync, readFileSync, statSync } from 'fs'
import mime from 'mime-types'
import { Handler } from '@tinyhttp/app'

const sendFile = (file: string) => {
  return readFileSync(`${process.cwd()}/${file}`).toString()
}

const staticFolder = (dir = process.cwd()): Handler => {
  const files = readdirSync(dir)

  return (req, res) => {
    let { url } = req

    const file = files.find(file => (url ? url.slice(1) === file : null))

    if (!res.writableEnded && file) {
      if (url === '/') {
        if (files.includes('index.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.statusCode = 200
          res.send(sendFile('index.html'))
        } else if (files.includes('index.txt')) {
          res.statusCode = 200
          res.send(sendFile('index.txt'))
        }
      } else if (file && !statSync(file).isDirectory()) {
        res.statusCode = 200
        res.setHeader('Content-Type', mime.contentType(file) || 'text/plain')
        res.send(sendFile(file))
      }
    }
  }
}

export default staticFolder
