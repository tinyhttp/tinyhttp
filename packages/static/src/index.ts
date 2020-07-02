import { stat, readFile, readdir } from 'fs/promises'
import { contentType } from 'mime-types'
import { Request, Response } from '@tinyhttp/app'
import { promise as recursiveReaddir } from 'readdirp'
import { parse } from 'path'
import { NextFunction } from '../../app/dist'

const sendFile = async (file: string) => {
  return (await readFile(`${file}`)).toString()
}

export type StaticHandlerOptions = Partial<{
  prefix: string
  recursive: boolean
}>

export const staticHandler = (
  dir = process.cwd(),
  { prefix, recursive }: StaticHandlerOptions = { prefix: '/', recursive: false }
) => {
  return async (req: Request, res: Response, next?: NextFunction) => {
    let files: string[]

    if (recursive) {
      files = (
        await recursiveReaddir(dir, {
          type: 'all'
        })
      ).map(f => f.path)
    } else {
      files = await readdir(dir)
    }

    if (req.url.startsWith(prefix)) {
      const file = files.find(file => {
        // remove prefix from URL
        let unPrefixedURL = req.url.replace(prefix, '')

        // strip extension for .html files
        if (unPrefixedURL) {
          return decodeURI(unPrefixedURL) === file
        } else return null
      })

      // use index.* for root
      if (req.url === prefix) {
        const indexFile = files.find(f => parse(f).name === 'index')
        if (indexFile) {
          const fileContent = await sendFile(`${dir}/${indexFile}`)
          res.set('Content-Type', 'text/html; charset=utf-8').send(fileContent)
        }
      }
      if (file) {
        const fPath = file
        const dirAndfilePath = `${dir}/${fPath}`

        // Check if directory
        const isDir = (await stat(dirAndfilePath)).isDirectory()

        // If directory, output a list of files
        if (isDir) {
          res.set('Content-Type', 'text/html; charset=utf-8')
          res.write(`<h1>Index of /${fPath}</h1>`)
          res.write('<ul>')
          for (const item of await readdir(dirAndfilePath)) {
            res.write(`<li><a href="/${fPath}/${item}">${item}</a></li>`)
          }
          res.end('</ul>')
        } else {
          const fileContent = await sendFile(dirAndfilePath)
          res.set('Content-Type', contentType(parse(file).ext) || 'text/plain').send(fileContent)
        }
      }
    }

    next?.()
  }
}
