![](https://tinyhttp.v1rtl.site/cover.jpg?t)

<div align="center">
<h1>tinyhttp</h1>
<p>⚡ Tiny web framework as a replacement of Express</p>
</div>

[![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)][site-url] [![npm](https://img.shields.io/npm/dt/@tinyhttp/app?style=flat-square)][npm-url] [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/talentlessguy/tinyhttp/CI?style=flat-square)][github-actions]
[![Codecov](https://img.shields.io/codecov/c/gh/talentlessguy/tinyhttp?style=flat-square)][codecov]
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@tinyhttp/app.svg?style=flat-square) [![Codacy grade](https://img.shields.io/codacy/grade/239a8cc7bca24042940f018a1ccec72f?style=flat-square)][codacy-url] [![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square)][gh-url] [![](https://img.shields.io/badge/repo-gitea-green?style=flat-square)][gitea-url] [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)][license]

_**tinyhttp**_ is a modern [Express](https://expressjs.com/)-like web framework written in TypeScript and compiled to native ESM, that uses a bare minimum amount of dependencies trying to avoid legacy hell.

Here is a short list of most important features that tinyhttp has:

- ⚡ [2.3x faster](benchmark) than Express
- ⚙ Full Express middleware support
- ↪ Async middleware support
- ☑ Native ESM and CommonJS support
- 🚀 No legacy dependencies, just the JavaScript itself
- 🔨 Types out of the box
- 🔥 Prebuilt middleware built for modern Node.js

To get started, visit [tinyhttp website](https://tinyhttp.v1rtl.site).

## Install

tinyhttp requires [Node.js 12.4.0 or newer](https://node.green/#ES2019). It is recommended to use [pnpm](https://pnpm.js.org/), although it isn't required.

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

tinyhttp is compiled to ESM (and legacy CommonJS) so you can use `import` / `export` syntax in Node.js with it.

To setup a Node ESM package, put `"type": "module"` in the package.json file, like this:

```json
{
  "type": "module"
}
```

Another option would be using an `.mjs` extension, then you don't need to put that `"type"` field in package.json.

For more info, check out the [ECMAScript Modules Node.js documentation](https://nodejs.org/api/esm.html).

From now on you can use named imports for ESM modules and default imports for CommonJS modules in your project.

The app structure is quite similar to Express, except that you need to import `App` from `@tinyhttp/app` instead of default import from `express`.

```ts
import { App } from '@tinyhttp/app'
import { logger } from '@tinyhttp/logger'

const app = new App()

app
  .use(logger())
  .use(function someMiddleware(req, res, next) {
    console.log('Did a request')
    next()
  })
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`You just opened ${req.params.page}`)
  })
  .listen(3000)
```

For more examples, check [examples](examples) folder.

## Middlewares

tinyhttp offers a list of premade middleware for common tasks, such as [session](https://tinyhttp.v1rtl.site/mw/session), [logger](https://tinyhttp.v1rtl.site/mw/logger) and [jwt](https://tinyhttp.v1rtl.site/mw/jwt).

Search and explore the full list at [middleware search page](https://tinyhttp.v1rtl.site/mw).

## Comparison

To compare tinyhttp with Express and Polka (another Express-like framework), see [COMPARISON.md](COMPARISON.md)

## Benchmarks

To see benchmark comparison between tinyhttp, polka, express and koa, check [benchmark](benchmark) folder.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://v1rtl.site"><img src="https://avatars0.githubusercontent.com/u/35937217?v=4" width="100px;" alt=""/><br /><sub><b>v 1 r t l</b></sub></a><br /><a href="#example-talentlessguy" title="Examples">💡</a> <a href="#plugin-talentlessguy" title="Plugin/utility libraries">🔌</a> <a href="#projectManagement-talentlessguy" title="Project Management">📆</a> <a href="#maintenance-talentlessguy" title="Maintenance">🚧</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=talentlessguy" title="Code">💻</a></td>
    <td align="center"><a href="https://brailor.me/"><img src="https://avatars3.githubusercontent.com/u/17928339?v=4" width="100px;" alt=""/><br /><sub><b>Matt</b></sub></a><br /><a href="#plugin-BRA1L0R" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=BRA1L0R" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/Betelgeuse1"><img src="https://avatars1.githubusercontent.com/u/45435407?v=4" width="100px;" alt=""/><br /><sub><b>Nasmevka</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=Betelgeuse1" title="Documentation">📖</a></td>
    <td align="center"><a href="http://elianiva.github.io"><img src="https://avatars0.githubusercontent.com/u/51877647?v=4" width="100px;" alt=""/><br /><sub><b>elianiva</b></sub></a><br /><a href="#example-elianiva" title="Examples">💡</a> <a href="#maintenance-elianiva" title="Maintenance">🚧</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=elianiva" title="Code">💻</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=elianiva" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://nitropage.com"><img src="https://avatars0.githubusercontent.com/u/4012401?v=4" width="100px;" alt=""/><br /><sub><b>Katja Lutz</b></sub></a><br /><a href="#example-katywings" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Arnovsky"><img src="https://avatars1.githubusercontent.com/u/7084871?v=4" width="100px;" alt=""/><br /><sub><b>Arnovsky</b></sub></a><br /><a href="#plugin-Arnovsky" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=Arnovsky" title="Code">💻</a></td>
    <td align="center"><a href="https://rocktim.xyz"><img src="https://avatars1.githubusercontent.com/u/33410545?v=4" width="100px;" alt=""/><br /><sub><b>Rocktim Saikia</b></sub></a><br /><a href="#infra-RocktimSaikia" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=RocktimSaikia" title="Code">💻</a> <a href="#example-RocktimSaikia" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/ahmad-reza619"><img src="https://avatars1.githubusercontent.com/u/52902060?v=4" width="100px;" alt=""/><br /><sub><b>Ahmad Reza</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=ahmad-reza619" title="Code">💻</a></td>
    <td align="center"><a href="https://typetron.org/"><img src="https://avatars3.githubusercontent.com/u/4083652?v=4" width="100px;" alt=""/><br /><sub><b>Ionel lupu</b></sub></a><br /><a href="#example-IonelLupu" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/tkalmi"><img src="https://avatars3.githubusercontent.com/u/14164217?v=4" width="100px;" alt=""/><br /><sub><b>Tomi Kalmi</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=tkalmi" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Luiginator"><img src="https://avatars2.githubusercontent.com/u/46606509?v=4" width="100px;" alt=""/><br /><sub><b>Luiginator</b></sub></a><br /><a href="#example-Luiginator" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/aneeshrelan"><img src="https://avatars2.githubusercontent.com/u/17068083?v=4" width="100px;" alt=""/><br /><sub><b>Aneesh Relan</b></sub></a><br /><a href="#example-aneeshrelan" title="Examples">💡</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=aneeshrelan" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://berto.github.io/"><img src="https://avatars3.githubusercontent.com/u/12090909?v=4" width="100px;" alt=""/><br /><sub><b>Roberto Ortega</b></sub></a><br /><a href="#example-berto" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/setheal"><img src="https://avatars2.githubusercontent.com/u/1657175?v=4" width="100px;" alt=""/><br /><sub><b>Barciet Maëlann</b></sub></a><br /><a href="#example-setheal" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/shzmr"><img src="https://avatars2.githubusercontent.com/u/55944948?v=4" width="100px;" alt=""/><br /><sub><b>shzmr</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=shzmr" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Supporters 💰

These amazing people supported tinyhttp financially:

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://molefrog.com/"><img src="https://avatars3.githubusercontent.com/u/671276?v=4" width="100px;" alt=""/><br /><sub><b>molefrog</b></sub></td>
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

## License

MIT © [v1rtl](https://v1rtl.site)

[site-url]: https://tinyhttp.v1rtl.site
[npm-url]: https://npmjs.com/package/@tinyhttp/app
[codecov]: https://codecov.io/gh/talentlessguy/tinyhttp
[github-actions]: https://github.com/talentlessguy/tinyhttp/actions
[license]: https://github.com/talentlessguy/tinyhttp/blob/master/LICENSE
[gh-url]: https://github.com/talentlessguy/tinyhttp
[codacy-url]: https://www.codacy.com/manual/talentlessguy/tinyhttp
[gitea-url]: https://git.v1rtl.site/v1rtl/tinyhttp
