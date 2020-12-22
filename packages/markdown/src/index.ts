import { IncomingMessage, ServerResponse } from 'http'
import { parse } from 'path'
import { existsSync } from 'fs'
import { readFile, readdir } from 'fs/promises'
import md, { MarkedOptions } from 'marked'
import path from 'path'
import { send } from '@tinyhttp/send'

type Caching =
  | Partial<{
      maxAge: number
      immutable: boolean
    }>
  | false

export type MarkdownServerHandlerOptions = Partial<{
  prefix: string
  stripExtension: boolean
  markedOptions: MarkedOptions
  caching: Caching
}>

type Request = Pick<IncomingMessage, 'url' | 'method'> & { originalUrl?: string }

type Response = Pick<ServerResponse, 'end' | 'setHeader' | 'statusCode' | 'removeHeader' | 'getHeader'>

const enableCaching = (res: Response, caching: Caching) => {
  if (caching) {
    let cc = caching.maxAge != null && `public,max-age=${caching.maxAge}`
    if (cc && caching.immutable) cc += ',immutable'
    else if (cc && caching.maxAge === 0) cc += ',must-revalidate'

    res.setHeader('Cache-Control', cc)
  }
}

const sendStream = async (
  path: string,
  markedOptions: MarkedOptions,
  req: Request,
  res: Response,
  caching: Caching
) => {
  const stream = await readFile(path)

  enableCaching(res, caching)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  send(req, res)(md(stream.toString(), markedOptions))
}

export const markdownStaticHandler = (dir?: string, opts: MarkdownServerHandlerOptions = {}) => async <
  Req extends Request = Request,
  Res extends Response = Response
>(
  req: Req,
  res: Res,
  next
) => {
  const { prefix = '/', stripExtension = true, markedOptions = null, caching = false } = opts

  const url = req.originalUrl || req.url

  const urlMatchesPrefix = url.startsWith(prefix)

  const unPrefixedURL: string = prefix === '/' ? url.replace(prefix, '') : url.replace(prefix, '').slice(1)

  const fullPath = path.join(dir, parse(unPrefixedURL).dir)

  let files: string[]

  try {
    files = await readdir(fullPath)
  } catch {
    next?.()
  }

  let filename: string

  if (url === prefix) {
    const idxFile = [
      `index.md`,
      `index.markdown`,
      `readme.md`,
      `README.md`,
      `readme.markdown`,
      `readme.md`
    ].find((file) => existsSync(path.join(fullPath, file)))

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
}
