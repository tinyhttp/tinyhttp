import { createReadStream, statSync } from 'node:fs'
import type { IncomingMessage as I, IncomingHttpHeaders, ServerResponse as S } from 'node:http'
import { extname, isAbsolute, join, normalize, sep } from 'node:path'
import { parseRange } from 'header-range-parser'
import { lookup } from 'mrmime'
import { createETag } from './utils.js'

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/
const STRONG_ETAG_REGEXP = /^"[\x21\x23-\x7e\x80-\xff]*"$/

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

type Req = Pick<I, 'headers'> & Partial<Pick<I, 'method'>>

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
    const { root, headers: customHeaders, encoding = 'utf-8', caching, ...options } = opts
    const headers = { ...customHeaders }

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

    const etagHeader = Object.keys(headers).find((name) => name.toLowerCase() === 'etag')
    const suppliedETag = etagHeader ? headers[etagHeader] : res.getHeader('ETag')
    const etag = typeof suppliedETag === 'string' ? suppliedETag : createETag(stats, encoding)
    headers[etagHeader ?? 'ETag'] = etag

    if (!res.getHeader('Content-Type')) headers['Content-Type'] = `${lookup(extname(path))}; charset=utf-8`

    let status = res.statusCode || 200

    const rangeHeader = Array.isArray(req.headers.range) ? req.headers.range[0] : req.headers.range

    // RFC 9110 §13.1.5: If-Range requires a strong validator. File metadata alone
    // cannot establish that the representation changed at most once in that second.
    const ifRangeHeader = req.headers['if-range']
    const ifRange = typeof ifRangeHeader === 'string' ? ifRangeHeader.trim() : undefined
    const matchesIfRange =
      ifRangeHeader === undefined || (ifRange !== undefined && STRONG_ETAG_REGEXP.test(ifRange) && ifRange === etag)

    // RFC 9110 §14.2: only GET has range semantics; ignore unknown units before parsing offsets.
    if (
      (req.method === undefined || req.method === 'GET') &&
      rangeHeader &&
      /^bytes=/i.test(rangeHeader) &&
      matchesIfRange
    ) {
      // Delegate parsing to header-range-parser (a maintained fork of the parser
      // Express uses). It never yields an inverted range, so a malformed header
      // such as `bytes=10-5` can no longer produce a negative Content-Length and
      // crash the process (GHSA-w65r-fqv6-q6w9).
      const ranges = parseRange(stats.size, rangeHeader, { combine: true, throwError: false })

      if (ranges === -1) {
        // Unsatisfiable (out of bounds or inverted) → 416.
        res
          .writeHead(416, {
            'Content-Range': `bytes */${stats.size}`
          })
          .end()
        return res
      }

      // A single satisfiable range → 206. Malformed (-2) or multi-range requests
      // fall through to a normal 200 full-body response.
      if (Array.isArray(ranges) && ranges.length === 1) {
        status = 206
        const { start, end } = ranges[0]

        options.start = start
        options.end = end

        headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`
        headers['Content-Length'] = (end - start + 1).toString()
        headers['Accept-Ranges'] = 'bytes'
      } else {
        headers['Content-Length'] = stats.size.toString()
      }
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
