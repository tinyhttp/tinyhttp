import { extname } from 'node:path'

export class CustomView {
  constructor(name, options = {}) {
    this.options = options
    this.ext = extname(name)
    this.engine = options.engines[this.ext]
    this.path = `${options.root}/${name}`
  }
  async render(options, data, cb) {
    this.engine(this.path, data, options, cb)
  }
}
