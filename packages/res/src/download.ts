import { contentDisposition } from '@tinyhttp/content-disposition'
import { sendFile } from '@tinyhttp/send'
import { extname, resolve, basename } from 'node:path'
import { IncomingMessage as Req, ServerResponse as Res } from 'node:http'
import { setContentType, setHeader } from './headers.js'
import type { SendFileOptions } from '@tinyhttp/send'

export type DownloadOptions = SendFileOptions &
  Partial<{
    headers: Record<string, string>
  }>

type Callback = (err?: any) => void

export const download =
  <Request extends Req = Req, Response extends Res = Res>(req: Request, res: Response) =>
  (path: string, filename?: string | Callback, options?: DownloadOptions | Callback, cb?: Callback): Response => {
    let done = cb
    let name = filename as string
    let opts = (options || null) as DownloadOptions

    // support function as second or third arg
    if (typeof filename === 'function') {
      done = filename
      name = null
    } else if (typeof options === 'function') {
      done = options
      opts = null
    }

    // set Content-Disposition when file is sent
    const headers = {
      'Content-Disposition': contentDisposition(name || basename(path))
    }

    // merge user-provided headers
    if (opts && opts.headers) {
      for (const key of Object.keys(opts.headers)) {
        if (key.toLowerCase() !== 'content-disposition') headers[key] = opts.headers[key]
      }
    }

    // merge user-provided options
    opts = { ...opts, headers }

    // send file

    return sendFile(req, res)(opts.root ? path : resolve(path), opts, done || (() => undefined))
  }

export const attachment =
  <Response extends Res>(res: Response) =>
  (filename?: string): Response => {
    if (filename) {
      setContentType(res)(extname(filename))
      filename = basename(filename)
    }

    setHeader(res)('Content-Disposition', contentDisposition(filename))

    return res
  }
