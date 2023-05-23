# @tinyhttp/send

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/send)
[![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/send)
[![][web-badge]](https://tinyhttp.v1rtl.site/mw/send)

Extensions for sending a response, including `send`, `sendStatus`, `status`,
`sendFile` and `json`. Works with any backend framework.

## Install

```sh
pnpm i @tinyhttp/send
```

## API

```js
import { json, send, sendStatus, status } from '@tinyhttp/send'
```

### `send(body)` [![][doc-badge]](https://tinyhttp.v1rtl.site/docs#ressend)

Sends the HTTP response.

The body parameter can be a Buffer object, a string, an object, or an array.

##### Example

```ts
res.send(Buffer.from('whoop'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Sorry, we cannot find that!')
res.status(500).send({ error: 'something blew up' })
```

### `json(body)` [![][doc-badge]](https://tinyhttp.v1rtl.site/docs#resjson)

Sends a JSON response. This method sends a response (with the correct
content-type) that is the parameter converted to a JSON string using
[`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

The parameter can be any JSON type, including object, array, string, boolean,
number, or null, and you can also use it to convert other values to JSON.

##### Example

```ts
res.json(null)
res.json({ user: 'tobi' })
res.status(500).json({ error: 'message' })
```

### `status(number)` [![][doc-badge]](https://tinyhttp.v1rtl.site/docs#resstatus)

Sets the HTTP status for the response. It is a chainable alias of Node’s
`response.statusCode`.

##### Example

```ts
res.status(403).end()
res.status(400).send('Bad Request')
```

### `sendStatus` [![][doc-badge]](https://tinyhttp.v1rtl.site/docs#ressendstatus)

Sets the response HTTP status code to statusCode and send its string
representation as the response body.

##### Example

```ts
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
```

If an unsupported status code is specified, the HTTP status is still set to
statusCode and the string version of the code is sent as the response body.

### `sendFile` [![][doc-badge]](https://tinyhttp.v1rtl.site/docs#ressendfile)

Sends a file by piping a stream to response. It also checks for extension to set
a proper `Content-Type` header.

> Path argument must be absolute. To use a relative path, specify the `root`
> option first.

##### Example

```js
res.sendFile('song.mp3', { root: process.cwd() }, (err) => console.log(err))
```

## Example

```js
import { createServer } from 'node:http'
import { send } from '@tinyhttp/send'

createServer((req, res) => send(req, res)('Hello World')).listen(3000)
```

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/send?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/send?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
[doc-badge]: https://img.shields.io/badge/-docs-hotpink?style=flat-square
