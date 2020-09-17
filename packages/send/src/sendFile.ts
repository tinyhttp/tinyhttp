import { IncomingMessage as I, ServerResponse as S } from 'http'
import { createReadStream } from 'fs'
import { isAbsolute, extname } from 'path'
import { contentType } from 'es-mime-types'

export type SendFileOptions = Partial<{
  root: string
}>

export type ReadStreamOptions = {
  flags?: string
  encoding?: BufferEncoding
  fd?: number
  mode?: number
  autoClose?: boolean
  emitClose?: boolean
  start?: number
  end?: number
  highWaterMark?: number
}

export const sendFile = <Request extends I = I, Response extends S = S>(_: Request, res: Response) => (path: string, options?: any, cb?: (err?: any) => void) => {
  if (!path) {
    if (typeof path !== 'string') {
      throw new TypeError('path must be a string to res.sendFile')
    }
    throw new TypeError('path argument is required to res.sendFile')
  }

  if (!isAbsolute(path)) {
    throw new TypeError('path must be absolute')
  }

  const stream = createReadStream(path, options)

  stream.on('error', (err) => void cb(err))

  stream.on('end', () => void cb())

  res.setHeader('Content-Type', contentType(extname(path)))

  stream.pipe(res)

  return res
}
