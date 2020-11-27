import { IncomingMessage as I, ServerResponse as S } from 'http'
import { createReadStream } from 'fs'
import { isAbsolute, extname } from 'path'
import { contentType } from 'es-mime-types'

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

type Res = Pick<S, 'setHeader'> & NodeJS.WritableStream

/**
 * Sends a file by piping a stream to response.
 *
 * It also checks for extension to set a proper `Content-Type` header.
 *
 * Path argument must be absolute. To use a relative path, specify the `root` option first.
 *
 * @param res Response
 */
export const sendFile = <Response extends Res = Res>(res: Response) => (
  path: string,
  opts: SendFileOptions = {},
  cb?: (err?: any) => void
) => {
  const { root, headers, ...options } = opts

  if (!path || typeof path !== 'string') throw new TypeError('path must be a string to res.sendFile')

  if (headers) {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  }

  if (!isAbsolute(path)) throw new TypeError('path must be absolute')

  const stream = createReadStream(root ? root + path : path, options)

  if (cb) stream.on('error', (err) => void cb(err)).on('end', () => void cb())

  res.setHeader('Content-Type', contentType(extname(path)))

  stream.pipe(res)

  return res
}
