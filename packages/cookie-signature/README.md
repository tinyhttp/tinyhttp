# @tinyhttp/cookie-signature

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/cookie-signature?style=flat-square)](https://npmjs.com/package/@tinyhttp/cookie-signature) [![npm](https://img.shields.io/npm/dt/@tinyhttp/cookie-signature?style=flat-square)](https://npmjs.com/package/@tinyhttp/cookie-signature)

HTTP cookie signing and unsigning. A rewrite of [cookie-signature](https://github.com/tj/node-cookie-signature) module.

## Install

```sh
pnpm i @tinyhttp/cookie-signature
```

## API

```js
import { sign, unsign } from '@tinyhttp/cookie-signature'
```

### `sign(val, secret)`

Signd the given `val` with `secret`.

### `unsign(val, secret)`

Unsign and decode the given `val` with `secret`, returning `false` if the signature is invalid.
