import { createReadStream, statSync } from 'node:fs'
import type { IncomingMessage as I, IncomingHttpHeaders, ServerResponse as S } from 'node:http'
import { extname, isAbsolute, join, normalize, sep } from 'node:path'
import { lookup } from 'mrmime'
import { createETag } from './utils.js'

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/

export type ReadStreamOptions = Partial<{
  flags: string
  encoding: BufferEncoding
  fd: number
  mode: number
  autoClose: boolean
  emitClose: boolean
  start: number
  end: number
  highWaterMark: number
}>

export type SendFileOptions = ReadStreamOptions &
  Partial<{
    root: string
    headers: IncomingHttpHeaders
    caching: Partial<{
      maxAge: number
      immutable: boolean
    }>
  }>

export type Caching = Partial<{
  maxAge: number
  immutable: boolean
}>

type Req = Pick<I, 'headers'>

type Res = Pick<S, 'setHeader' | 'statusCode' | 'writeHead' | 'getHeader'> & NodeJS.WritableStream

export const enableCaching = (res: Res, caching: Caching): void => {
  let cc = caching.maxAge != null && `public,max-age=${caching.maxAge}`
  if (cc && caching.immutable) cc += ',immutable'
  else if (cc && caching.maxAge === 0) cc += ',must-revalidate'

  if (cc) res.setHeader('Cache-Control', cc)
}

/**
 * Sends a file by piping a stream to response.
 *
 * It also checks for extension to set a proper `Content-Type` header.
 *
 * Path argument must be absolute. To use a relative path, specify the `root` option first.
 *
 * @param res Response
 */
export const sendFile =
  <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) =>
  (path: string, opts: SendFileOptions = {}, cb?: (err?: Error) => void): Response => {
    const { root, headers = {}, encoding = 'utf-8', caching, ...options } = opts

    if (!isAbsolute(path) && !root) throw new TypeError('path must be absolute')

    if (!root && UP_PATH_REGEXP.test(path)) throw new TypeError('path must not contain ".."')

    if (caching) enableCaching(res, caching)

    const filePath = root
      ? (() => {
          const normalizedPath = normalize(`.${sep}${path}`)

          if (UP_PATH_REGEXP.test(normalizedPath)) throw new TypeError('path must not contain ".."')

          return join(root, normalizedPath)
        })()
      : path

    const stats = statSync(filePath)

    headers['Content-Encoding'] = encoding

    headers['Last-Modified'] = stats.mtime.toUTCString()

    headers.ETag = createETag(stats, encoding)

    if (!res.getHeader('Content-Type')) headers['Content-Type'] = `${lookup(extname(path))}; charset=utf-8`

    let status = res.statusCode || 200

    if (req.headers.range) {
      status = 206

      const rangeHeader = Array.isArray(req.headers.range) ? req.headers.range[0] : req.headers.range
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)

      const start = match?.[1] ? Number.parseInt(match[1], 10) : 0
      const end = match?.[2] ? Number.parseInt(match[2], 10) : stats.size - 1

      // Reject malformed (`bytes=abc`, `bytes=-`), inverted (`bytes=10-5`) or
      // out-of-bounds ranges with a 416 before any headers are committed, so a
      // client-supplied Range header can't crash the process (GHSA-w65r-fqv6-q6w9).
      if (!match || end < start || start >= stats.size || end >= stats.size) {
        res
          .writeHead(416, {
            'Content-Range': `bytes */${stats.size}`
          })
          .end()
        return res
      }

      options.start = start
      options.end = end

      headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`
      headers['Content-Length'] = (end - start + 1).toString()
      headers['Accept-Ranges'] = 'bytes'
    } else {
      headers['Content-Length'] = stats.size.toString()
    }

    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v as string)

    res.writeHead(status, headers)

    const stream = createReadStream(filePath, options)

    if (cb) stream.on('error', (err) => cb(err)).on('end', () => cb())

    stream.pipe(res)

    return res
  }
