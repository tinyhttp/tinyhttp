import { parse, format } from 'es-content-type'
import etag from '@tinyhttp/etag'

export const createETag = (
  body: Buffer | string,
  encoding: 'utf8' | undefined
) => {
  const buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body
  return etag(buf, { weak: true })
}

export function setCharset(type: string, charset: string) {
  const parsed = parse(type)
  parsed.parameters.charset = charset
  return format(parsed)
}
