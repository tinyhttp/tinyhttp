import { Request, Response } from '@tinyhttp/app'
import { parse } from 'path'
import { existsSync } from 'fs'
import { readFile, readdir, access } from 'fs/promises'
import { promise as recursiveReaddir } from 'readdirp'
import md, { MarkedOptions, Renderer } from 'marked'

export type MarkdownServerHandlerOptions = Partial<{
  prefix: string
  stripExtension: boolean
  recursive: boolean
  markedOptions: MarkedOptions
  markedExtensions: MarkedOptions[]
}>

export const markdownStaticHandler = (
  dir = process.cwd(),
  { prefix, stripExtension, recursive, markedOptions, markedExtensions }: MarkdownServerHandlerOptions = {
    prefix: '/',
    stripExtension: false,
    recursive: false,
    markedOptions: null,
    markedExtensions: []
  }
) => async (req: Request, res: Response) => {
  if (req.url.startsWith(prefix)) {
    const unPrefixedURL = req.url.replace(prefix, '').slice(1)

    if (req.url === prefix) {
      let idxFile: string

      if (existsSync(`${dir}/index.md`)) {
        idxFile = `${dir}/index.md`
      } else if (existsSync(`${dir}/index.markdown`)) {
        idxFile = `${dir}/index.markdown`
      }

      const content = (await readFile(idxFile)).toString()

      res.set('Content-Type', 'text/html').send(md(content))
    }

    let files: string[]

    if (recursive) {
      files = (await recursiveReaddir(dir)).map(f => f.path)
    } else {
      files = await readdir(dir)
    }

    let file: string

    if (stripExtension) {
      file = files.find(f => {
        const ext = parse(f).ext
        const name = parse(f).name

        return /\.(md|markdown)/.test(ext) && unPrefixedURL === name
      })
    } else {
      file = files.find(f => {
        return f === decodeURI(unPrefixedURL).slice(1)
      })
    }

    if (file) {
      const content = (await readFile(`${dir}/${file}`)).toString()

      if (markedExtensions?.length !== 0) {
        for (const ext of markedExtensions) {
          md.use(ext)
        }
      }

      res.set('Content-Type', 'text/html').send(md(content, markedOptions))
    }
  }
}
