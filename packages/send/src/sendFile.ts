import { IncomingMessage as I, ServerResponse as S } from 'http'
import { createReadStream, ReadStream, statSync } from 'fs'
import { isAbsolute, extname } from 'path'
import { contentType } from 'es-mime-types'
import { createETag } from './utils'
import { join } from 'path'

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
    headers: Record<string, any>
  }>

type Req = Pick<I, 'headers'>

type Res = Pick<S, 'setHeader' | 'statusCode' | 'writeHead'> & NodeJS.WritableStream

/**
 * Sends a file by piping a stream to response.
 *
 * It also checks for extension to set a proper `Content-Type` header.
 *
 * Path argument must be absolute. To use a relative path, specify the `root` option first.
 *
 * @param res Response
 */
export const sendFile = <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) => (
  path: string,
  opts: SendFileOptions = {},
  cb?: (err?: any) => void
) => {
  const { root, headers = {}, encoding = 'utf-8', ...options } = opts

  if (!isAbsolute(path) && !root) throw new TypeError('path must be absolute')

  const filePath = root ? join(root, path) : path

  const stats = statSync(filePath)

  headers['Content-Encoding'] = encoding

  headers['Last-Modified'] = stats.mtime.toUTCString()

  headers['Content-Type'] = contentType(extname(path))

  headers['ETag'] = createETag(stats, encoding)

  let status = 200

  if (req.headers['range']) {
    status = 206
    const [x, y] = req.headers.range.replace('bytes=', '').split('-')
    const end = (options.end = parseInt(y, 10) || stats.size - 1)
    const start = (options.start = parseInt(x, 10) || 0)

    if (start >= stats.size || end >= stats.size) {
      res
        .writeHead(416, {
          'Content-Range': `bytes */${stats.size}`
        })
        .end()
      return res
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`
    headers['Content-Length'] = end - start + 1
    headers['Accept-Ranges'] = 'bytes'
  } else {
    headers['Content-Length'] = stats.size
  }

  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)

  res.writeHead(status, headers)

  const stream = createReadStream(filePath, options)

  if (cb) stream.on('error', (err) => cb(err)).on('end', () => cb())

  stream.pipe(res)

  return res
}
