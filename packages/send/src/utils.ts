import { Stats } from 'node:fs'
import { format, parse } from '@tinyhttp/content-type'
import { eTag } from '@tinyhttp/etag'

export const createETag = (body: Buffer | string | Stats, encoding: BufferEncoding): string =>
  eTag(body instanceof Stats ? body : !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body, {
    weak: true
  })

export function setCharset(type: string, charset: string): string {
  const parsed = parse(type)
  // biome-ignore lint/style/noNonNullAssertion: the function sets the charset
  parsed.parameters!.charset = charset
  return format(parsed)
}
