# @tinyhttp/cors

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/cors?style=flat-square)](npmjs.com/package/@tinyhttp/cors) [![npm](https://img.shields.io/npm/dt/@tinyhttp/cors?style=flat-square)](npmjs.com/package/@tinyhttp/cors) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/cors)

> A rewrite of [cors](https://github.com/expressjs/cors) module.

CORS middleware for HTTP servers.

## Install

```sh
pnpm i @tinyhttp/cors
```

## API

```ts
import { cors } from '@tinyhttp/cors'
```

### Options

#### `host`

Host that is allowed to send cross-origin requests. Defaults to `'*'`.

#### `methods`

Allowed methods for performing a cross-origin request. Default ones are `['GET', 'POST', 'PUT', 'PATCH', 'HEAD']` and can be accessed with `defaultMethods`.

#### `headers`

Allowed HTTP headers that can be sent in a cross-origin request. Default ones are `['Origin', 'X-Requested-With', 'Content-Type']` and can be accessed with `defaultHeaders`.

## Example

```ts
import { App } from '@tinyhttp/app'
import { cors } from '@tinyhttp/cors'

const app = new App()

app
  .use(
    cors({
      host: 'https://example.com'
    })
  )
  .get('/', (_, res) => void res.end('Hello World'))
```

## License

MIT © [v1rtl](https://v1rtl.site)
