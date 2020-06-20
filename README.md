![](assets/cover.jpg)

![Twitter](https://img.shields.io/twitter/follow/v1rtl.svg?label=sub%20to%20twitter&style=flat-square) ![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) ![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)

# tinyhttp

> ⚠ The project is incomplete. Please don't use in production.

**tinyhttp** is a modern Express-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy.

## Installation

Node.js 13 is required.

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

app.all('/', (req, res) => {
  res.status(200).send(`
    <h1>tinyhttp example</h1>
    <ul>
      <li>Protocol: ${req.protocol}</li>
      <li>HTTPS: ${req.secure ? 'yes' : 'no'}</li>
      <li>URL: ${req.url}</li>
      <li>Method: ${req.method}</li>
      <li>Host: ${req.hostname}</li>
      <li>Status: ${res.statusCode}</li>
    </ul>
    <h2>Request headers</h2>
<pre>
${JSON.stringify(req.headers, null, 2)}
</pre>
`)
})

app.get('/:first/:second', (req, res) => {
  res.json({ URLParams: req.params, QueryParams: req.query })
})

app.use(staticFolder())

app.use(logger())

app.listen(3000)
```
