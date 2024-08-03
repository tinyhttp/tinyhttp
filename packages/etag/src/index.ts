// Original module: https://github.com/jshttp/etag/blob/master/index.js

import { createHash } from 'node:crypto'
import { Stats } from 'node:fs'

const entityTag = (entity: string | Buffer): string => {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  }
  // generate hash
  const hash = createHash('sha1')
    .update(entity as string, 'utf8')
    .digest('base64')
    .substring(0, 27)

  const len = typeof entity === 'string' ? Buffer.byteLength(entity, 'utf8') : entity.length

  return `"${len.toString(16)}-${hash}"`
}

const statTag = ({ mtime, size }: Stats): string => {
  return `"${mtime.getTime().toString(16)}-${size.toString(16)}"`
}

export const eTag = (entity: string | Buffer | Stats, options?: { weak: boolean }): string => {
  if (entity == null) throw new TypeError('argument entity is required')

  const weak = options?.weak || entity instanceof Stats

  // generate entity tag

  const tag = entity instanceof Stats ? statTag(entity) : entityTag(entity)

  return weak ? `W/${tag}` : tag
}
