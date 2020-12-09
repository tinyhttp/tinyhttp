# @tinyhttp/pug

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/pug) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/pug) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/pug)

[Pug](https://github.com/pugjs/pug) wrapped in a helper function for tinyhttp.

## Install

```sh
pnpm i @tinyhttp/pug
```

## Example

```js
import { App } from '@tinyhttp/app'
import { pug } from '@tinyhttp/pug'

pug(/* Pug options */)(new App())
  .get((req, res) => res.render('index.pug'))
  .listen(3000)
```

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/pug?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/pug?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
