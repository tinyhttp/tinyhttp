# @tinyhttp/static

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/static?style=flat-square)](https://npmjs.com/package/@tinyhttp/static) [![npm](https://img.shields.io/npm/dt/@tinyhttp/static?style=flat-square)](https://npmjs.com/package/@tinyhttp/static) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/static)

tinyhttp static middleware. This is a very basic module with limited usage. For advanced use cases use [serve-handler](https://github.com/vercel/serve-handler).

## Install

```sh
pnpm i @tinyhttp/static
```

## API

```ts
import { staticHandler, fileToString } from '@tinyhttp/static'
```

### `staticHandler(dir, options)`

Returns the middleware to handle static files.

#### Options

- `prefix` - URL prefix to add to routes and remove from file paths
- `recursive` - handle all files including folders contents or only root folder. If `true`, `readdirp` will be used. Otherwise `fs.readdir`.

### `fileToString(path)`

Reads file and converts to UTF-8 string.

## Example

```ts
import { App } from '@tinyhttp/app'
import { staticHandler } from '@tinyhttp/static'

const app = new App()

app.use(
  staticHandler('docs', {
    prefix: '/docs',
    recursive: true,
  })
)

app.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)
