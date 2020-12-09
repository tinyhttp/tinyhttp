# @tinyhttp/jwt

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/jwt?style=flat-square)](https://npmjs.com/package/@tinyhttp/jwt) [![npm](https://img.shields.io/npm/dt/@tinyhttp/jwt?style=flat-square)](https://npmjs.com/package/@tinyhttp/jwt) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/jwt)

JWT middleware for HTTP servers.

## Install

```sh
pnpm i @tinyhttp/jwt
```

## API

```ts
import { jwt } from '@tinyhttp/jwt'
```

### Options

#### `jwt(options)`

- `secret`: can be an array of strings (in case you are using private / public key encryption), or just a string if you are using basic HMAC signing (see the examples below)
- `algorithm? ("HS256")`: the algorithm used to sign and verify the token
- `audience?`: the expected "audience" of the jwt token
- `issuer?`: who issued this token
- `expiresIn?`: expiration time of the token (ex: `1d` for 1 day)
- `notBefore?`: not before date of the token (ex: `20m` for 20 minutes)
- `requestHeaderName? ("Authorization")`: the name of the header contaning the Bearer token
- `responseHeaderName? ("X-Token")`: the name of the response header containing the new signed token that will be used later on
- `getToken(string)?: string`: the method used for ex

## Example

### Basic secret

```ts
import { App } from '@tinyhttp/app'
import { jwt } from '@tinyhttp/jwt'

new App()
  .use(jwt({ secret: 'secret', algorithm: 'HS256' }))
  .get('/', (req, res) => res.send(`Data inside the payload: ${req['user']}`))
  .listen(8080)
```

### Private / Public key

```ts
import { App } from '@tinyhttp/app'
import { jwt } from '@tinyhttp/jwt'

new App()
  .use(jwt({ secret: ['PRIVATE KEY', 'PUBLIC KEY'], algorithm: 'RS256' }))
  .get('/', (req, res) => res.send(`Data inside the payload: ${req['user']}`))
  .listen(8080)
```
