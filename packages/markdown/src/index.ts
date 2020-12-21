import type { AsyncHandler, Response } from '@tinyhttp/app'
import { parse } from 'path'
import { createReadStream, existsSync } from 'fs'
import { readFile, readdir } from 'fs/promises'
import md, { MarkedOptions } from 'marked'
import { streamdown } from 'streamdown'
import path from 'path'

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

const enableCaching = (res: Response, caching: Caching) => {
  if (caching) {
    let cc = caching.maxAge != null && `public,max-age=${caching.maxAge}`
    if (cc && caching.immutable) cc += ',immutable'
    else if (cc && caching.maxAge === 0) cc += ',must-revalidate'

    res.set('Cache-Control', cc)
  }
}

const sendStream = (path: string, markedOptions: MarkedOptions, res: Response, caching: Caching) => {
  const stream = createReadStream(path)

  enableCaching(res, caching)

  res.set('Content-Type', 'text/html')

  stream.on('open', () => stream.pipe(streamdown({ markedOptions })).pipe(res))
}

export const markdownStaticHandler = (dir?: string, opts: MarkdownServerHandlerOptions = {}): AsyncHandler => async (
  req,
  res,
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
      sendStream(path.join(fullPath, idxFile), markedOptions, res, caching)
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
    sendStream(path.join(fullPath, filename), markedOptions, res, caching)
  } else next()
}
