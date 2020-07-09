# tinyhttp

[![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site) [![Twitter](https://img.shields.io/twitter/follow/v1rtl.svg?label=sub%20to%20twitter&style=flat-square)](twitter.com/v1rtl) [![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app)

> ⚠ The project is in development. Please don't use in production.

_**tinyhttp**_ is a modern Express-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy hell.

Here is a short list of most important features that tinyhttp has:

- ⚙ Full Express middleware support
- ↪ Async middleware support
- 📦 8x smaller than Express
- 🏃 No legacy dependencies
- 🔨 Types out of the box
- ☑ Native ESM and CommonJS support

To get started, visit [tinyhttp website](https://tinyhttp.v1rtl.site).

## Install

[Node.js 12.4.0 or newer](https://node.green/#ES2019) is required.

```sh
# npm
npm i @tinyhttp/app
# pnpm
pnpm i @tinyhttp/app
# yarn
yarn add @tinyhttp/app
```

## Docs

You can see the documentation [here](https://tinyhttp.v1rtl.site/docs).

## Example

```ts
import { App } from '@tinyhttp/app'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .use(function someMiddleware(req, res, next) {
    console.log('Did a request')
    next()
  })
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`${JSON.stringify(req.params, null, 2)}`)
  })
  .use(logger())
  .listen(3000)
```

For more examples check [examples](https://github.com/talentlessguy/tinyhttp/blob/master/examples) folder.

## Middlewares

tinyhttp offers a list of premade middleware for common tasks.

Search and explore the full list at [middleware search page](https://tinyhttp.v1rtl.site/mw).
