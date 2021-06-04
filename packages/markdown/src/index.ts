import { IncomingMessage, ServerResponse } from 'http'
import { parse } from 'path'
import { readFile, readdir } from 'fs/promises'
import md, { MarkedOptions } from 'marked'
import path from 'path'
import { send, Caching, enableCaching } from '@tinyhttp/send'

export type MarkdownServerHandlerOptions = Partial<{
  prefix: string
  stripExtension: boolean
  markedOptions: MarkedOptions
  caching: Caching | false
}>

type Request = Pick<IncomingMessage, 'url' | 'method'> & { originalUrl?: string }

type Response = Pick<ServerResponse, 'end' | 'setHeader' | 'statusCode' | 'removeHeader' | 'getHeader' | 'writeHead'> &
  NodeJS.WritableStream

const sendStream = async (
  path: string,
  markedOptions: MarkedOptions,
  req: Request,
  res: Response,
  caching: Caching | false
) => {
  const file = await readFile(path)

  if (caching) enableCaching(res, caching)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  send(req, res)(md(file.toString(), markedOptions))
}

export const markdownStaticHandler =
  (dir?: string, opts: MarkdownServerHandlerOptions = {}) =>
  async <Req extends Request = Request, Res extends Response = Response>(
    req: Req,
    res: Res,
    next: (err?: any) => void
  ) => {
    const { prefix = '/', stripExtension = true, markedOptions = null, caching = false } = opts

    const url = req.originalUrl || req.url

    const urlMatchesPrefix = url.startsWith(prefix)

    const unPrefixedURL: string = prefix === '/' ? url.replace(prefix, '') : url.replace(prefix, '').slice(1)

    const fullPath = path.join(dir, parse(unPrefixedURL).dir)

    let files: string[]

    try {
      files = await readdir(fullPath)

      let filename: string

      if (url === prefix) {
        const rgx = /(index|readme).(md|markdown)/i

        const idxFile = files.find((file) => rgx.test(file))

        if (idxFile) {
          await sendStream(path.join(fullPath, idxFile), markedOptions, req, res, caching)
          return
        } else next()
      }
      if (stripExtension) {
        filename = files.find((f) => {
          const { name, ext } = parse(f)

          return /\.(md|markdown)/.test(ext) && unPrefixedURL === name
        })
      } else {
        filename = files.find((f) => f === decodeURI(unPrefixedURL))
      }

      if (urlMatchesPrefix && filename) {
        await sendStream(path.join(fullPath, filename), markedOptions, req, res, caching)
      } else next()
    } catch {
      next?.()
    }
  }
