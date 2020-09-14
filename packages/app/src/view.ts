import fs from 'fs'
import { dirname, basename, extname, join, resolve } from 'path'

/**
 * Return a stat, maybe.
 */
function tryStat(path: string) {
  try {
    return fs.statSync(path)
  } catch (e) {
    return undefined
  }
}

export class View {
  name: string
  ext: string
  root: unknown
  defaultEngine: string
  engine: (path: string, opts: unknown, callback: () => any) => any
  path: string

  constructor(
    name: string,
    opts: {
      defaultEngine: string
      engines: string[]
      root: unknown
    }
  ) {
    this.name = name

    this.ext = extname(name)

    this.defaultEngine = opts.defaultEngine
    this.root = opts.root

    if (!this.ext && !this.defaultEngine) {
      throw new Error('No default engine was specified and no extension was provided.')
    }

    let fileName = name

    if (!this.ext) {
      // get extension from default engine name
      this.ext = this.defaultEngine[0] !== '.' ? '.' + this.defaultEngine : this.defaultEngine

      fileName += this.ext
    }

    if (!opts.engines[this.ext]) {
      // load engine
      const mod = this.ext.substr(1)

      // default engine export
      const fn = import(mod).then((mod) => mod.__express)

      if (typeof fn !== 'function') {
        throw new Error('Module "' + mod + '" does not provide a view engine.')
      }

      opts.engines[this.ext] = fn
    }

    // store loaded engine
    this.engine = opts.engines[this.ext]

    // lookup path
    this.path = this.lookup(fileName)
  }
  /**
   * Lookup view by the given `name`
   * @param name
   */
  lookup(name: string) {
    let path: string
    const roots = [].concat(this.root)

    for (let i = 0; i < roots.length && !path; i++) {
      const root = roots[i]

      // resolve the path
      const loc = resolve(root, name)
      const dir = dirname(loc)
      const file = basename(loc)

      // resolve the file
      path = this.resolve(dir, file)
    }

    return path
  }
  /**
   * Resolve the file within the given directory.
   * @param dir
   * @param file
   */
  resolve(dir: string, file: string) {
    const ext = this.ext

    // <path>.<ext>
    let path = join(dir, file)
    let stat = tryStat(path)

    if (stat && stat.isFile()) {
      return path
    }

    // <path>/index.<ext>
    path = join(dir, basename(file, ext), 'index' + ext)
    stat = tryStat(path)

    if (stat && stat.isFile()) {
      return path
    }
  }
  render(options: any, callback: () => any) {
    this.engine(this.path, options, callback)
  }
}
