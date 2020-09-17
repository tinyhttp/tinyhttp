# @tinyhttp/ping

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/ping) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/ping) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/ping)

> Inspired by [koa-response-time](https://github.com/koajs/response-time)

Response time checker for tinyhttp. Sets `X-Response-Time` header using `process.hrtime()`

## Install

```sh
pnpm i @tinyhttp/ping
```

## API

```js
import { ping } from '@tinyhttp/ping'
```

### Options

#### `round`

Round the ping time. Default is set to true.

## Example

```js
import { ping } from '@tinyhttp/ping'
import { createServer } from 'http'
import path from 'path'

const server = http.createServer(async (req, res) => {
  ping()(req, res)
  res.end('Hello World')
})

server.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/ping?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/ping?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
