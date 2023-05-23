# @tinyhttp/content-disposition

> [`content-disposition`](https://github.com/jshttp/content-disposition) rewrite
> in TypeScript.

Create and parse HTTP `Content-Disposition` header

## Install

```sh
pnpm i @tinyhttp/content-disposition
```

## API

```ts
import { contentDisposition, parse } from '@tinyhttp/content-disposition'
```

### `contentDisposition(filename)`

Create an attachment `Content-Disposition` header value using the given file
name, if supplied. The `filename` is optional and if no file name is desired,
but you want to specify `options`, set `filename` to `undefined`.

```js
res.setHeader('Content-Disposition', contentDisposition('∫ maths.pdf'))
```

**note** HTTP headers are of the ISO-8859-1 character set. If you are writing
this header through a means different from `setHeader` in Node.js, you'll want
to specify the `'binary'` encoding in Node.js.

#### Options

`contentDisposition` accepts these properties in the options object.

##### `fallback`

If the `filename` option is outside ISO-8859-1, then the file name is actually
stored in a supplemental field for clients that support Unicode file names and a
ISO-8859-1 version of the file name is automatically generated.

This specifies the ISO-8859-1 file name to override the automatic generation or
disables the generation all together, defaults to `true`.

- A string will specify the ISO-8859-1 file name to use in place of automatic
  generation.
- `false` will disable including a ISO-8859-1 file name and only include the
  Unicode version (unless the file name is already ISO-8859-1).
- `true` will enable automatic generation if the file name is outside
  ISO-8859-1.

If the `filename` option is ISO-8859-1 and this option is specified and has a
different value, then the `filename` option is encoded in the extended field and
this set as the fallback field, even though they are both ISO-8859-1.

##### `type`

Specifies the disposition type, defaults to `"attachment"`. This can also be
`"inline"`, or any other value (all values except inline are treated like
`attachment`, but can convey additional information if both parties agree to
it). The type is normalized to lower-case.

### `contentDisposition.parse(string)`

```js
contentDisposition.parse('attachment; filename="EURO rates.txt"; filename*=UTF-8\'\'%e2%82%ac%20rates.txt')
```

Parse a `Content-Disposition` header string. This automatically handles extended
("Unicode") parameters by decoding them and providing them under the standard
parameter name. This will return an object with the following properties
(examples are shown for the string
`'attachment; filename="EURO rates.txt"; filename*=UTF-8\'\'%e2%82%ac%20rates.txt'`):

- `type`: The disposition type (always lower case). Example: `'attachment'`

- `parameters`: An object of the parameters in the disposition (name of
  parameter always lower case and extended versions replace non-extended
  versions). Example: `{filename: "€ rates.txt"}`

## Example

This simple example shows how to use `accepts` to return a different typed
respond body based on what the client wants to accept. The server lists it's
preferences in order and will get back the best match between the client and
server.

```ts
import { contentDisposition } from '@tinyhttp/content-disposition'
import destroy from 'destroy'
import fs from 'node:fs'
import { createServer } from 'node:http'
import onFinished from 'on-finished'

const filePath = '/path/to/public/plans.pdf'

createServer((req, res) => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', contentDisposition(filePath))

  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
  onFinished(res, () => destroy(stream))
})
```
