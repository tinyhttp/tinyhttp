import { renderFile, Options } from 'pug'
import type { App } from '@tinyhttp/app'

export const pug = (options?: Options) => {
  return function pug(app: App<Options>) {
    return app.engine('pug', (path, _, opts, cb) => renderFile(path, options || opts, cb))
  }
}
