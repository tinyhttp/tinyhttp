# @tinyhttp/accepts

> [`accepts`](https://github.com/jshttp/accepts) rewrite in TypeScript.

Higher level content negotiation based on
[negotiator](https://www.npmjs.com/package/negotiator). Extracted from
[koa](https://www.npmjs.com/package/koa) for general use.

In addition to negotiator, it allows:

- Allows types as an array or arguments list, ie
  `(['text/html', 'application/json'])` as well as
  `('text/html', 'application/json')`.
- Allows type shorthands such as `json`.
- Returns `false` when no types match
- Treats non-existent headers as `*`

## Install

```sh
pnpm i @tinyhttp/accepts
```

## API

```ts
import { Accepts } from '@tinyhttp/accepts'
```

### accepts(req)

Create a new `Accepts` object for the given `req`.

#### `.charset(charsets)`

Return the first accepted charset. If nothing in `charsets` is accepted, then
`false` is returned.

#### `.charsets()`

Return the charsets that the request accepts, in the order of the client's
preference (most preferred first).

#### `.encoding(encodings)`

Return the first accepted encoding. If nothing in `encodings` is accepted, then
`false` is returned.

#### `.encodings()`

Return the encodings that the request accepts, in the order of the client's
preference (most preferred first).

#### `.language(languages)`

Return the first accepted language. If nothing in `languages` is accepted, then
`false` is returned.

#### `.languages()`

Return the languages that the request accepts, in the order of the client's
preference (most preferred first).

#### `.type(types)`

Return the first accepted type (and it is returned as the same text as what
appears in the `types` array). If nothing in `types` is accepted, then `false`
is returned.

The `types` array can contain full MIME types or file extensions. Any value that
is not a full MIME types is passed to `require('mime-types').lookup`.

#### `.types()`

Return the types that the request accepts, in the order of the client's
preference (most preferred first).

## Example

This simple example shows how to use `accepts` to return a different typed
respond body based on what the client wants to accept. The server lists it's
preferences in order and will get back the best match between the client and
server.

```ts
import Accepts from '@tinyhttp/accepts'
import { createServer } from 'node:http'

createServer((req, res) => {
  const accept = new Accepts(req)

  // the order of this list is significant; should be server preferred order
  switch (accept.type(['json', 'html'])) {
    case 'json':
      res.setHeader('Content-Type', 'application/json')
      res.write('{"hello":"world!"}')
      break
    case 'html':
      res.setHeader('Content-Type', 'text/html')
      res.write('<b>hello, world!</b>')
      break
    default:
      // the fallback is text/plain, so no need to specify it above
      res.setHeader('Content-Type', 'text/plain')
      res.write('hello, world!')
      break
  }

  res.end()
}).listen(3000)
```

You can test this out with the cURL program:

```sh
curl -I -H 'Accept: text/html' http://localhost:3000/
```
