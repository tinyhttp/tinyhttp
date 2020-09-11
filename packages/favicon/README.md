# @tinyhttp/favicon

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/favicon) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/favicon) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/favicon)

> A rewrite of [serve-favicon](https://github.com/expressjs/serve-favicon) module.

Favicon middleware to serve `favicon.ico` file.

## Install

```sh
pnpm i @tinyhttp/favicon
```

## API

```js
import { favicon } from '@tinyhttp/favicon'
```

### Options

`favicon` accepts these properties in the options object.

#### `path`

Path to icon, required. Passed as the first argument.

#### `maxAge`

Sets `Cache-Control: maxAge=` header, optional. Default is one year. Passed with object in the second argument.

## Example

```js
import { favicon } from '@tinyhttp/favicon'
import { createServer } from 'http'
import path from 'path'

const server = http.createServer(async (req, res) => {
  return (await favicon(path.join(process.cwd(), 'public', 'favicon.ico')))(req, res)
})

server.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/favicon?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/favicon?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
