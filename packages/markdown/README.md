# @tinyhttp/markdown

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/markdown?style=flat-square)](https://npmjs.com/package/@tinyhttp/markdown) [![npm](https://img.shields.io/npm/dt/@tinyhttp/markdown?style=flat-square)](https://npmjs.com/package/@tinyhttp/markdown) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/markdown)

tinyhttp static markdown middleware based on [streamdown](https://github.com/talentlessguy/streamdown) (markdown library). Used by [tinyhttp website](https://tinyhttp.v1rtl.site).

## Install

```sh
pnpm i @tinyhttp/markdown
```

## API

### `markdownStaticHandler(dir, options)`

Handles static files and transforms markdown in HTML in a specified directory. It tries to assign root to `README.md` or `index.md` (and with `.markdown` extension too) in case any of them exists.

#### Options

- `prefix` - URL prefix to add to routes and remove from file paths
- `stripExtension` - remove `.md` (or `.markdown`) extension from markdown files. Enabled by defaults.
- `markedOptions` - initial [marked](https://github.com/markedjs/marked) options to be used by the handler.

## Example

```ts
import { App } from '@tinyhttp/app'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'

new App()
  .use(
    md('docs', {
      prefix: '/docs',
      stripExtension: true,
      markedExtensions: [
        {
          headerIds: true
        }
      ]
    })
  )
  .listen(3000)
```
