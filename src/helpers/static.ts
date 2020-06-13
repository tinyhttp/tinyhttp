import { readdirSync, readFileSync, statSync } from 'fs'
import mime from 'mime-types'
import notFound from './notFound'
import { Handler } from '../index'

const sendFile = (file: string) => {
  let content = readFileSync(`${process.cwd()}/${file}`)

  return content.toString()
}

const staticFolder = (dir = process.cwd()): Handler => {
  const files = readdirSync(dir)

  return (req, res) => {
    let { url } = req

    const file = files.find(file => (url ? url.slice(1) === file : null))

    if (url === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      })
      if (files.includes('index.html')) {
        res.end(sendFile('index.html'))
      } else if (files.includes('index.txt')) {
        res.end(sendFile('index.txt'))
      }
    } else if (file && !statSync(file).isDirectory()) {
      res.writeHead(200, {
        'Content-Type': mime.contentType(file) || 'text/plain'
      })
      res.end(sendFile(file))
    } else {
      notFound()(req, res)
    }
  }
}

export default staticFolder
