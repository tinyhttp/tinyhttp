# @tinyhttp/markdown

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/markdown?style=flat-square)](https://npmjs.com/package/@tinyhttp/markdown) [![npm](https://img.shields.io/npm/dt/@tinyhttp/markdown?style=flat-square)](https://npmjs.com/package/@tinyhttp/markdown) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/markdown)

tinyhttp static markdown middleware Based on [marked](https://github.com/markedjs/marked) (markdown library) and [@tinyhttp/static](https://tinyhttp.v1rtl.site/mw/static). Useful for creating simple static Markdown sites with basic routing. Used by [tinyhttp website](https://tinyhttp.v1rtl.site).

## Install

```sh
pnpm i @tinyhttp/static
```

## API

### `markdownStaticHandler(dir, options)`

Handles static files and transforms markdown in HTML in a specified directory. It tries to assign root to `README.md` or `index.md` (and with `.markdown` extension too) in case any of them exists.

#### Options

- `prefix` - URL prefix to add to routes and remove from file paths
- `stripExtension` - remove `.md` (or `.markdown`) extension from markdown files. Enabled by defaults.
- `recursive` - handle all files including folders contents or only root folder. If `true`, `readdirp` will be used. Otherwise `fs.readdir`.
- `markedOptions` - initial [marked](https://github.com/markedjs/marked) options to be used by the handler.
- `markedExtensions` - additional [marked](https://github.com/markedjs/marked) options that are applied using `marked.use`.

## Example

```ts
import { App } from '@tinyhttp/app'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'

const app = new App()

app.use(
  md('docs', {
    prefix: '/docs',
    stripExtension: true,
    markedExtensions: [
      {
        headerIds: true,
      },
    ],
  })
)

app.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)
