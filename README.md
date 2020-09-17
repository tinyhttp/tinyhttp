![](assets/cover.jpg)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<div align="center">
<h1>tinyhttp</h1>

[![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site) [![Twitter](https://img.shields.io/twitter/follow/v1rtl.svg?label=sub%20to%20twitter&style=flat-square)](twitter.com/v1rtl) [![npm type definitions](https://img.shields.io/npm/types/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/talentlessguy/tinyhttp/CI?style=flat-square)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/body-parsec.svg?style=flat-square) ![Codacy grade](https://img.shields.io/codacy/grade/239a8cc7bca24042940f018a1ccec72f?style=flat-square) ![David (path)](https://img.shields.io/david/talentlessguy/tinyhttp?path=packages%2Fapp&style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square) [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)](npmjs.com/@tinyhttp/app)

<p>⚡ Tiny web framework as a replacement of Express</p>

</div>

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

tinyhttp requires [Node.js 12.4.0 or newer](https://node.green/#ES2019) or newer. It is recommended to use [pnpm](https://pnpm.js.org/) because tinyhttp reuses modules in some middlewares.

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

## Get Started

The app structure is quite similar to Express, except that you need to import `App` from `@tinyhttp/app` instead of default import from `express`.

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

For more examples, check [examples](https://github.com/talentlessguy/tinyhttp/blob/master/examples) folder.

## Middlewares

tinyhttp offers a list of premade middleware for common tasks.

Search and explore the full list at [middleware search page](https://tinyhttp.v1rtl.site/mw).

## License

MIT © [v1rtl](https://v1rtl.site)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://brailor.me/"><img src="https://avatars3.githubusercontent.com/u/17928339?v=4" width="100px;" alt=""/><br /><sub><b>Matt</b></sub></a><br /><a href="#plugin-BRA1L0R" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=BRA1L0R" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!