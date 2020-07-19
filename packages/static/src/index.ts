import { stat, readFile, readdir } from 'fs/promises'
import { contentType } from 'es-mime-types'
import { Request, Response, NextFunction, AsyncHandler } from '@tinyhttp/app'
import { promise as recursiveReaddir } from 'readdirp'
import { parse } from 'path'

export const fileToString = async (path: string) => {
  return (await readFile(`${path}`)).toString('utf-8')
}

export type StaticHandlerOptions = Partial<{
  prefix: string
  recursive: boolean
}>

export const staticHandler = (dir = process.cwd(), opts?: StaticHandlerOptions): AsyncHandler => {
  return async (req: Request, res: Response, next?: NextFunction) => {
    let files: string[]

    const prefix = opts?.prefix ?? '/'
    const recursive = opts?.recursive ?? false

    if (recursive) {
      files = (
        await recursiveReaddir(dir, {
          type: 'all',
        })
      ).map((f) => f.path)
    } else {
      files = await readdir(dir)
    }

    if (req.url.startsWith(prefix)) {
      const file = files.find((file) => {
        // remove prefix from URL
        const unPrefixedURL = req.url.replace(prefix, '')

        // strip extension for .html files
        if (unPrefixedURL) {
          return decodeURI(unPrefixedURL) === file
        } else return null
      })

      // use index.* for root
      if (req.url === prefix) {
        const indexFile = files.find((f) => parse(f).name === 'index')
        if (indexFile) {
          const fileContent = await fileToString(`${dir}/${indexFile}`)
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
          const fileContent = await fileToString(dirAndfilePath)
          res.set('Content-Type', contentType(parse(file).ext) || 'text/plain').send(fileContent)
        }
      }
    }

    next?.()
  }
}
