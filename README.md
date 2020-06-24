![](assets/cover.jpg)

![Twitter](https://img.shields.io/twitter/follow/v1rtl.svg?label=sub%20to%20twitter&style=flat-square) ![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) ![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)

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

## Example

At the moment there is only one basic example. I will add more of them once I add all the existing Express `req` / `res` extensions.

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
