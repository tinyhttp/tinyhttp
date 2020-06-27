import { promises as fs } from 'fs'
import { contentType } from 'mime-types'
import { Request, Response } from '@tinyhttp/app'
import readdir from 'readdirp'

const sendFile = async (file: string) => {
  return fs.readFile(`${file}`).toString()
}

const staticFolder = (dir = process.cwd()) => {
  return async (req: Request, res: Response) => {
    const files = await readdir.promise(dir)

    const file = files.find(file => (req.url ? decodeURI(req.url).slice(1) === file.path : null))

    if (!res.writableEnded) {
      if (req.url === '/') {
        if (files.find(f => f.path === 'index.html')) {
          res.set('Content-Type', 'text/html; charset=utf-8').send(sendFile(`${dir}/index.html`))
        } else if (files.find(f => f.path === 'index.html')) {
          res.set('Content-Type', 'text/plain').send(sendFile(`${dir}/index.txt`))
        }
      }

      if (file) {
        const isDir = (await fs.stat(`${dir}/${file.path}`)).isDirectory()
        if (isDir) {
          // TODO
        } else {
          res.set('Content-Type', contentType(file.basename) || 'text/plain').send(sendFile(`${dir}/${file.path}`))
        }
      }
    }
  }
}

export default staticFolder
