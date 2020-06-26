![](assets/cover.jpg)

[![Twitter](https://img.shields.io/twitter/follow/v1rtl.svg?label=sub%20to%20twitter&style=flat-square)](twitter.com/v1rtl) [![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app)

# tinyhttp

> ⚠ The project is incomplete. Please don't use in production.

**tinyhttp** is a modern Express-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy.

## Installation

Node.js 12.4.0 or newer (according to https://node.green/#ES2019) is required.

```sh
# npm
npm i @tinyhttp/app
# pnpm
pnpm i @tinyhttp/app
# yarn
yarn add @tinyhttp/app
```

## Features

- Compatible with Express
- Async routes [not tested yet]
- Smaller size
- 0 legacy dependencies

## Docs

Coming soon...

## Examples

Here is a basic example of using middleware and routes:

```ts
import { App } from '@tinyhttp/app'
import staticFolder from '@tinyhttp/static'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`${JSON.stringify(req.params, null, 2)}`)
  })
  .use(logger())
  .use(staticFolder())
  .listen(3000)
```

For more examples check [examples](https://github.com/talentlessguy/tinyhttp/blob/master/examples) folder.
