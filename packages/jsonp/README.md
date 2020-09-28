# @tinyhttp/jsonp

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/jsonp?style=flat-square)](https://npmjs.com/package/@tinyhttp/jsonp) [![npm](https://img.shields.io/npm/dt/@tinyhttp/jsonp?style=flat-square)](https://npmjs.com/package/@tinyhttp/jsonp) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/jsonp)

JSONP middleware module.

## Install

```sh
pnpm i @tinyhttp/jsonp
```

## Example

```js
import { App } from '@tinyhttp/app'
import { jsonp } from '@tinyhttp/jsonp'

const app = new App()

app.use((req, res, next) => {
  res.jsonp = jsonp(req, res, app)
  next()
})

app.get('/', (req, res) => {
  res.jsonp({ some: 'jsonp' })
})

app.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)
