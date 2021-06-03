![](https://tinyhttp.v1rtl.site/cover.jpg)

<div align="center">
<h1>tinyhttp</h1>
<p>⚡ Tiny web framework as a replacement of Express</p>
</div>

[![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)][site-url] [![npm](https://img.shields.io/npm/dm/@tinyhttp/app?style=flat-square)][npm-url] [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/talentlessguy/tinyhttp/CI?style=flat-square)][github-actions]
[![Codecov](https://img.shields.io/codecov/c/gh/talentlessguy/tinyhttp?style=flat-square)][codecov]
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@tinyhttp/app.svg?style=flat-square) [![Codacy grade](https://img.shields.io/codacy/grade/239a8cc7bca24042940f018a1ccec72f?style=flat-square)][codacy-url] [![Last commit](https://img.shields.io/github/last-commit/talentlessguy/tinyhttp.svg?style=flat-square)][gh-url] [![NPM](https://img.shields.io/npm/l/@tinyhttp/app?style=flat-square)][license]

> 🦕 tinyhttp now has a [Deno port](https://github.com/talentlessguy/tinyhttp-deno) (work in progress)

_**tinyhttp**_ is a modern [Express](https://expressjs.com/)-like web framework written in TypeScript and compiled to native ESM, that uses a bare minimum amount of dependencies trying to avoid legacy hell.

Here is a short list of most important features that tinyhttp has:

- ⚡ [2x faster](#benchmarks) than Express
- ⚙ Full Express middleware support
- ↪ Async middleware support
- ☑ Native ESM and CommonJS support
- 🚀 No legacy dependencies, just the JavaScript itself
- 🔨 Types out of the box
- 🔥 Prebuilt middleware for modern Node.js

Visit [tinyhttp website](https://tinyhttp.v1rtl.site) for docs, guides and middleware search.

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

Create a new project using [tinyhttp CLI](https://github.com/talentlessguy/tinyhttp/tree/master/packages/cli):

```sh
pnpm i -g @tinyhttp/cli

tinyhttp new basic my-app

cd my-app
```

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

See tinyhttp ["Learn" page](https://tinyhttp.v1rtl.site/learn) for complete guide.

## Middlewares

tinyhttp offers a list of premade middleware for common tasks, such as [rate limiting](https://tinyhttp.v1rtl.site/mw/rate-limit), [logging](https://tinyhttp.v1rtl.site/mw/logger) and [JWT integration](https://tinyhttp.v1rtl.site/mw/jwt).

Search and explore the full list at [middleware search page](https://tinyhttp.v1rtl.site/mw).

## Comparison

See [COMPARISON.md](COMPARISON.md).

## Benchmarks

See [global framework benchmark](https://web-frameworks-benchmark.netlify.app/result?f=tinyhttp,express,polka,fastify).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://v1rtl.site"><img src="https://avatars0.githubusercontent.com/u/35937217?v=4?s=100" width="100px;" alt=""/><br /><sub><b>v 1 r t l</b></sub></a><br /><a href="#example-talentlessguy" title="Examples">💡</a> <a href="#plugin-talentlessguy" title="Plugin/utility libraries">🔌</a> <a href="#projectManagement-talentlessguy" title="Project Management">📆</a> <a href="#maintenance-talentlessguy" title="Maintenance">🚧</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=talentlessguy" title="Code">💻</a></td>
    <td align="center"><a href="https://brailor.me/"><img src="https://avatars3.githubusercontent.com/u/17928339?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matt</b></sub></a><br /><a href="#plugin-BRA1L0R" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=BRA1L0R" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/Betelgeuse1"><img src="https://avatars1.githubusercontent.com/u/45435407?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nasmevka</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=Betelgeuse1" title="Documentation">📖</a></td>
    <td align="center"><a href="http://elianiva.github.io"><img src="https://avatars0.githubusercontent.com/u/51877647?v=4?s=100" width="100px;" alt=""/><br /><sub><b>elianiva</b></sub></a><br /><a href="#example-elianiva" title="Examples">💡</a> <a href="#maintenance-elianiva" title="Maintenance">🚧</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=elianiva" title="Code">💻</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=elianiva" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://nitropage.com"><img src="https://avatars0.githubusercontent.com/u/4012401?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Katja Lutz</b></sub></a><br /><a href="#example-katywings" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Arnovsky"><img src="https://avatars1.githubusercontent.com/u/7084871?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arnovsky</b></sub></a><br /><a href="#plugin-Arnovsky" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=Arnovsky" title="Code">💻</a></td>
    <td align="center"><a href="https://rocktim.xyz"><img src="https://avatars1.githubusercontent.com/u/33410545?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rocktim Saikia</b></sub></a><br /><a href="#infra-RocktimSaikia" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=RocktimSaikia" title="Code">💻</a> <a href="#example-RocktimSaikia" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/ahmad-reza619"><img src="https://avatars1.githubusercontent.com/u/52902060?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ahmad Reza</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=ahmad-reza619" title="Code">💻</a></td>
    <td align="center"><a href="https://typetron.org/"><img src="https://avatars3.githubusercontent.com/u/4083652?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ionel lupu</b></sub></a><br /><a href="#example-IonelLupu" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/tkalmi"><img src="https://avatars3.githubusercontent.com/u/14164217?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tomi Kalmi</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=tkalmi" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Luiginator"><img src="https://avatars2.githubusercontent.com/u/46606509?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Luiginator</b></sub></a><br /><a href="#example-Luiginator" title="Examples">💡</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=Luiginator" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/aneeshrelan"><img src="https://avatars2.githubusercontent.com/u/17068083?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aneesh Relan</b></sub></a><br /><a href="#example-aneeshrelan" title="Examples">💡</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=aneeshrelan" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://berto.github.io/"><img src="https://avatars3.githubusercontent.com/u/12090909?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roberto Ortega</b></sub></a><br /><a href="#example-berto" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/setheal"><img src="https://avatars2.githubusercontent.com/u/1657175?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Barciet Maëlann</b></sub></a><br /><a href="#example-setheal" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/shzmr"><img src="https://avatars2.githubusercontent.com/u/55944948?v=4?s=100" width="100px;" alt=""/><br /><sub><b>shzmr</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=shzmr" title="Code">💻</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=shzmr" title="Tests">⚠️</a> <a href="#example-shzmr" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/eavam"><img src="https://avatars1.githubusercontent.com/u/16797465?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Egor Avakumov</b></sub></a><br /><a href="#example-eavam" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Rashmi-K-A"><img src="https://avatars2.githubusercontent.com/u/39820442?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rashmi K A</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=Rashmi-K-A" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/shubhi23994"><img src="https://avatars3.githubusercontent.com/u/11757228?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shubhi Agarwal</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=shubhi23994" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/MaurizioPz"><img src="https://avatars2.githubusercontent.com/u/455216?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maurizio</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=MaurizioPz" title="Tests">⚠️</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=MaurizioPz" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jkreller"><img src="https://avatars0.githubusercontent.com/u/33465273?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jkreller</b></sub></a><br /><a href="#example-jkreller" title="Examples">💡</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/alancarpilovsky/"><img src="https://avatars3.githubusercontent.com/u/8486092?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alan Carpilovsky</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=alcar" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/KoljaTM"><img src="https://avatars1.githubusercontent.com/u/2526416?v=4?s=100" width="100px;" alt=""/><br /><sub><b>KoljaTM</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=KoljaTM" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/iketiunn"><img src="https://avatars1.githubusercontent.com/u/10249208?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ike</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=iketiunn" title="Documentation">📖</a> <a href="#example-iketiunn" title="Examples">💡</a></td>
    <td align="center"><a href="https://fabianmoronzirfas.me"><img src="https://avatars3.githubusercontent.com/u/315106?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fabian Morón Zirfas</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Afabianmoronzirfas" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/vitalybaev"><img src="https://avatars2.githubusercontent.com/u/724423?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vitaly Baev</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=vitalybaev" title="Tests">⚠️</a> <a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Avitalybaev" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://omrilotan.com"><img src="https://avatars0.githubusercontent.com/u/516342?v=4?s=100" width="100px;" alt=""/><br /><sub><b>omrilotan</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=omrilotan" title="Code">💻</a> <a href="https://github.com/talentlessguy/tinyhttp/commits?author=omrilotan" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/MVEMCJSUNPE"><img src="https://avatars2.githubusercontent.com/u/10354503?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MVEMCJSUNPE</b></sub></a><br /><a href="#example-MVEMCJSUNPE" title="Examples">💡</a> <a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3AMVEMCJSUNPE" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://yello.io"><img src="https://avatars0.githubusercontent.com/u/43667677?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leo Toneff</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=bragle" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://calumk.com"><img src="https://avatars1.githubusercontent.com/u/1183991?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Calum Knott</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=calumk" title="Documentation">📖</a> <a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Acalumk" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://reinaldyrafli.com"><img src="https://avatars.githubusercontent.com/u/7274326?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Reinaldy Rafli</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=aldy505" title="Code">💻</a> <a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Aaldy505" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/lakgani"><img src="https://avatars.githubusercontent.com/u/8769642?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ganesh Pendyala</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=lakgani" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/khmm12"><img src="https://avatars.githubusercontent.com/u/4437249?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maxim</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Akhmm12" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/wasd845"><img src="https://avatars.githubusercontent.com/u/15626210?v=4?s=100" width="100px;" alt=""/><br /><sub><b>wasd845</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/issues?q=author%3Awasd845" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://bandism.net/"><img src="https://avatars.githubusercontent.com/u/22633385?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ikko Ashimine</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=eltociear" title="Documentation">📖</a></td>
    <td align="center"><a href="https://stanislas.blog"><img src="https://avatars.githubusercontent.com/u/11699655?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stanislas</b></sub></a><br /><a href="https://github.com/talentlessguy/tinyhttp/commits?author=angristan" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Sponsors 💰

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://deta.sh?ref=tinyhttp"><img src="https://i.snipboard.io/VFbSna.jpg" width="100px;" alt=""/><br /><sub><b>Deta</b></sub></td> <td align="center"><a href="https://molefrog.com/"><img src="https://avatars3.githubusercontent.com/u/671276?v=4" width="100px;" alt=""/><br /><sub><b>molefrog</b></sub></td> <td align="center"><a href="https://thecarrots.io/"><img src="https://i.snipboard.io/PEDbp3.jpg" width="100px;" alt=""/><br /><sub><b>Carrots</b></sub></td>
  </tr>
  
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

## Donate

[![PayPal](https://img.shields.io/badge/PayPal-cyan?style=flat-square&logo=paypal)](https://paypal.me/v1rtl) [![ko-fi](https://img.shields.io/badge/kofi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/v1rtl) [![Qiwi](https://img.shields.io/badge/qiwi-white?style=flat-square&logo=qiwi)](https://qiwi.com/n/V1RTL) [![Yandex Money](https://img.shields.io/badge/Yandex_Money-yellow?style=flat-square&logo=yandex)](https://money.yandex.ru/to/410014774355272)

[![Bitcoin](https://badge-crypto.vercel.app/api/badge?coin=btc&address=3PxedDftWBXujWtr7TbWQSiYTsZJoMD8K5)](https://badge-crypto.vercel.app/btc/3PxedDftWBXujWtr7TbWQSiYTsZJoMD8K5) [![Ethereum](https://badge-crypto.vercel.app/api/badge?balance=true&coin=eth&address=0xD3B282e9880cDcB1142830731cD83f7ac0e1043f)
](https://badge-crypto.vercel.app/eth/0xD3B282e9880cDcB1142830731cD83f7ac0e1043f)

The best way to support the project is to stake it on [**DEV**](https://stakes.social/0x14308514785B216904a41aB817282d25425Cce39). Note that you also get rewarded by staking, as well as the project author.

[![DEV](https://badge.devprotocol.xyz/0x14308514785B216904a41aB817282d25425Cce39)](https://stakes.social/0x14308514785B216904a41aB817282d25425Cce39)

## License

MIT © [v1rtl](https://v1rtl.site)

[site-url]: https://tinyhttp.v1rtl.site
[npm-url]: https://npmjs.com/package/@tinyhttp/app
[codecov]: https://codecov.io/gh/talentlessguy/tinyhttp
[github-actions]: https://github.com/talentlessguy/tinyhttp/actions
[license]: https://github.com/talentlessguy/tinyhttp/blob/master/LICENSE
[gh-url]: https://github.com/talentlessguy/tinyhttp
[codacy-url]: https://www.codacy.com/manual/talentlessguy/tinyhttp
