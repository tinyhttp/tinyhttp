# @tinyhttp/jsonp

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/jsonp?style=flat-square)](https://npmjs.com/package/@tinyhttp/jsonp) [![npm](https://img.shields.io/npm/dt/@tinyhttp/jsonp?style=flat-square)](https://npmjs.com/package/@tinyhttp/jsonp) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/jsonp)

JSONP response extension.

## Install

```sh
pnpm i @tinyhttp/jsonp
```

## Example

```js
import { App, extendMiddleware } from '@tinyhttp/app'
import { jsonp } from '@tinyhttp/jsonp'

new App({
  applyExtensions: (req, res) => {
    extendMiddleware(req, res)
    json(req, res)
  }
})
  .get('/', (req, res) => res.jsonp({ some: 'jsonp' }))
  .listen(3000)
```
