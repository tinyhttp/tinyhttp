/*!
 * Ported from https://github.com/expressjs/express/blob/master/lib/view.js
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import { statSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import type { TemplateEngine, TemplateEngineOptions } from './types.js'

function tryStat(path: string) {
  try {
    return statSync(path)
  } catch {
    return undefined
  }
}

/**
 * Initialize a new `View` with the given `name`.
 *
 * Options:
 *
 *   - `defaultEngine` the default template engine name
 *   - `engines` template engine require() cache
 *   - `root` root path for view lookup
 *
 * @param name
 * @param options
 * @public
 */

export class View<RenderOptions extends TemplateEngineOptions = TemplateEngineOptions> {
  ext?: string
  defaultEngine?: string
  name: string
  engine: TemplateEngine<RenderOptions>
  path: string
  root: string | string[] = []
  constructor(
    name: string,
    opts: Partial<{
      defaultEngine: string
      root: string | string[]
      engines: Record<string, TemplateEngine<RenderOptions>>
    }> = {}
  ) {
    this.ext = extname(name)
    this.name = name
    if (opts.root) this.root = opts.root
    if (opts.defaultEngine) this.defaultEngine = opts.defaultEngine

    if (!this.ext && !this.defaultEngine)
      throw new Error('No default engine was specified and no extension was provided.')

    let fileName = name

    if (!this.ext) {
      // get extension from default engine name
      this.ext = this.defaultEngine?.[0] !== '.' ? `.${this.defaultEngine}` : this.defaultEngine

      fileName += this.ext
    }

    if (!opts.engines?.[this.ext]) throw new Error(`No engine was found for ${this.ext}`)
    const path = this.#lookup(fileName)
    const dirs =
      Array.isArray(this.root) && this.root.length > 1
        ? `directories "${this.root.slice(0, -1).join('", "')}" or "${this.root[this.root.length - 1]}"`
        : `directory "${this.root}"`
    if (!path) throw new Error(`Failed to lookup view "${name}" in views ${dirs}`)
    this.engine = opts.engines[this.ext]
    this.path = path as string
  }
  #lookup(name: string) {
    let path: string | undefined
    const roots = ([] as string[]).concat(this.root)

    for (let i = 0; i < roots.length && !path; i++) {
      const root = roots[i]
      // resolve the path
      const loc = resolve(root, name)
      const dir = dirname(loc)
      const file = basename(loc)

      // resolve the file
      path = this.#resolve(dir, file)
    }

    return path
  }
  #resolve(dir: string, file: string) {
    const ext = this.ext

    // <path>.<ext>
    let path = join(dir, file)
    let stat = tryStat(path)

    if (stat?.isFile()) {
      return path
    }

    // <path>/index.<ext>
    path = join(dir, basename(file, ext), `index${ext}`)
    stat = tryStat(path)

    if (stat?.isFile()) {
      return path
    }
  }
  render(options: RenderOptions, data: Record<string, unknown>, cb: (err: Error | null, html: unknown) => void) {
    this.engine(this.path, data, options, cb)
  }
}
