import { Stats } from 'node:fs'
import { format, parse } from '@tinyhttp/content-type'
import { eTag } from '@tinyhttp/etag'

export const createETag = (body: Buffer | string | Stats, encoding: BufferEncoding): string => {
  if (body instanceof Stats) {
    return eTag(body, { weak: true })
  }
  return eTag(!Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body, { weak: true })
}

export function setCharset(type: string, charset: string): string {
  const parsed = parse(type)
  parsed.parameters.charset = charset
  return format(parsed)
}
