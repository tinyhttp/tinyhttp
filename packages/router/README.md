# @tinyhttp/router

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/router) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/router)

Framework-agnostic HTTP router.

## Install

```sh
pnpm i @tinyhttp/router
```

## Example

```js
import { Router } from '@tinyhttp/router'

const router = new Router()

router.get('/', (req, res) => res.send('Hello World'))

console.log(router.middleware)
```

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/router?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/router?style=flat-square
