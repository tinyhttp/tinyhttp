import { contentDisposition } from '@tinyhttp/content-disposition'
import { sendFile } from '@tinyhttp/send'
import { extname, resolve } from 'path'
import { IncomingMessage as I, ServerResponse as S } from 'http'
import { setContentType, setHeader } from './headers'
import type { SendFileOptions } from '@tinyhttp/send'

export type DownloadOptions = SendFileOptions &
  Partial<{
    headers: Record<string, any>
  }>

type Callback = (err?: any) => void

export const download = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (
  path: string,
  filename?: string | Callback,
  options?: DownloadOptions | Callback,
  cb?: Callback
): Response => {
  let done = cb
  let name = filename as string
  let opts = (options || null) as DownloadOptions

  // support function as second or third arg
  if (typeof filename === 'function') {
    done = filename
    name = null
    opts = null
  } else if (typeof options === 'function') {
    done = options
    opts = null
  }

  // set Content-Disposition when file is sent
  const headers = {
    'Content-Disposition': contentDisposition(name || path),
  }

  // merge user-provided headers
  if (opts && opts.headers) {
    for (const key of Object.keys(opts.headers)) {
      if (key.toLowerCase() !== 'content-disposition') {
        headers[key] = opts.headers[key]
      }
    }
  }

  // merge user-provided options
  opts = Object.create(opts)
  opts.headers = headers

  // Resolve the full path for sendFile
  const fullPath = resolve(path)

  const noop = () => {
    return
  }

  // send file
  return sendFile(req, res)(fullPath, opts, done || noop)
}

export const attachment = <Request extends I = I, Response extends S = S>(req: Request, res: Response) => (filename?: string): Response => {
  if (filename) {
    setContentType(req, res)(extname(filename))
  }

  setHeader(req, res)('Content-Disposition', contentDisposition(filename))

  return res
}
