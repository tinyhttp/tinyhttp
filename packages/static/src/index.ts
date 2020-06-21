import { promises as fs } from 'fs'
import * as mime from 'mime-types'
import { Request, Response } from '@tinyhttp/app'

const sendFile = async (file: string) => {
  return (await fs.readFile(`${process.cwd()}/${file}`)).toString()
}

const staticFolder = (dir = process.cwd()) => {
  const getFiles = async () => await fs.readdir(dir)

  return async (req: Request, res: Response) => {
    let { url } = req

    const files = await getFiles()

    const file = files.find(file => (url ? url.slice(1) === file : null))

    if (!res.writableEnded && file) {
      if (url === '/') {
        if (files.includes('index.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.status(200).send(sendFile('index.html'))
        } else if (files.includes('index.txt')) {
          res.status(200).send(sendFile('index.txt'))
        }
      } else if (file && !(await fs.stat(file)).isDirectory()) {
        res.statusCode = 200
        res.setHeader('Content-Type', mime.contentType(file) || 'text/plain')
        res.send(sendFile(file))
      }
    }
  }
}

export default staticFolder
