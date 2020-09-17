// Original module: https://github.com/jshttp/etag/blob/master/index.js

import { createHash } from 'crypto'
import { Stats } from 'fs'

const entityTag = (entity: string | Buffer) => {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
  } else {
    // generate hash
    const hash = createHash('sha1')
      .update(entity as string, 'utf8')
      .digest('base64')
      .substring(0, 27)

    const len = typeof entity === 'string' ? Buffer.byteLength(entity, 'utf8') : entity.length

    return '"' + len.toString(16) + '-' + hash + '"'
  }
}

const statTag = ({ mtime, size }: Stats) => {
  return '"' + mtime.getTime().toString(16) + '-' + size.toString(16) + '"'
}

export const eTag = (entity: string | Buffer | Stats, options?: { weak: boolean }) => {
  if (entity == null) {
    throw new TypeError('argument entity is required')
  }

  const weak = options?.weak || entity instanceof Stats

  // generate entity tag

  const tag = entity instanceof Stats ? statTag(entity) : entityTag(entity)

  return weak ? 'W/' + tag : tag
}
