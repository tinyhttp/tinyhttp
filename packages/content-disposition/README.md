# @tinyhttp/content-disposition

> Port of [`content-disposition@3.1.0`](https://github.com/jshttp/content-disposition)
> in TypeScript.

Create and parse HTTP `Content-Disposition` header

## Install

```sh
pnpm i @tinyhttp/content-disposition
```

## API

```ts
import { create, parse, format } from '@tinyhttp/content-disposition'
```

### `create(filename, options)`

Create an attachment `Content-Disposition` header value using the given file name,
if supplied. The `filename` is optional and if no file name is desired, but you
want to specify `options`, set `filename` to `undefined`.

```js
res.setHeader('Content-Disposition', create('∫ maths.pdf'))
```

**note** The `filename` is used as given; it is not reduced to its base name.
Pass only the file name (e.g. using `path.basename`) rather than a full path,
otherwise the path is sent to the client and exposes your directory structure.

**note** HTTP headers are of the ISO-8859-1 character set. If you are writing this
header through a means different from `setHeader` in Node.js, you'll want to specify
the `'binary'` encoding in Node.js.

#### Options

`create` accepts these properties in the options object.

##### `fallback`

If the `filename` option is outside US-ASCII, then the file name is actually
stored in a supplemental field for clients that support Unicode file names and
a US-ASCII version of the file name is automatically generated.

This specifies the US-ASCII file name to override the automatic generation or
disables the generation all together, defaults to `true`.

- A string will specify the US-ASCII file name to use in place of automatic
  generation. It must be US-ASCII, otherwise a `TypeError` is thrown.
- `false` will disable including a US-ASCII file name and only include the
  Unicode version (unless the file name is already US-ASCII).
- `true` will enable automatic generation if the file name is outside US-ASCII.

If the `filename` option is US-ASCII and this option is specified and has a
different value, then the `filename` option is encoded in the extended field
and this set as the fallback field, even though they are both US-ASCII.

##### `type`

Specifies the disposition type, defaults to `"attachment"`. This can also be
`"inline"`, or any other value (all values except inline are treated like
`attachment`, but can convey additional information if both parties agree to
it).

### `parse(string, options)`

```js
const disposition = parse('attachment; filename="EURO rates.txt"; filename*=UTF-8\'\'%e2%82%ac%20rates.txt')
```

Parse a `Content-Disposition` header string. This automatically handles extended
("Unicode") parameters by decoding them and providing them under the standard
parameter name. This will return an object with the following properties:

- `type`: The disposition type (always lower case). Example: `'attachment'`

- `parameters`: An object of the parameters in the disposition (name of parameter
  always lower case and extended versions replace non-extended versions). Example:
  `{filename: "€ rates.txt"}`

#### Options

##### `multipart`

Parse parameters using browser `multipart/form-data` behavior.

```js
parse('form-data; name="file"; filename="the %22plans%22.pdf"', {
  multipart: true
})
```

##### `extended`

Parse RFC 8187 extended header parameters automatically when decoding
parameters, defaults to `true`.

### `format(obj, options)`

```js
const disposition = format({
  type: 'attachment',
  parameters: {
    filename: '€ rates.txt'
  }
})
```

Formats an object to a `Content-Disposition` header string. This automatically
handles extended ("Unicode") parameters and returns a string. Example:
`'attachment; filename*=UTF-8\'\'%E2%82%AC%20rates.txt'`

#### Options

##### `multipart`

Format parameters using browser `multipart/form-data` behavior. This quotes
parameter values, escapes `"` as `%22`, and writes Unicode values directly
instead of using extended parameters.

```js
format(
  {
    type: 'form-data',
    parameters: { name: 'file', filename: '€ rates.txt' }
  },
  { multipart: true }
)
```

##### `extended`

Encode Unicode parameter values using RFC 8187 extended header parameters,
e.g. `filename*=`, defaults to `true`.

### `contentDisposition(filename, options)`

Deprecated alias of [`create`](#createfilename-options), kept for backwards
compatibility. Use `create` instead.

## Example

Send a file for download:

```ts
import fs from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { create } from '@tinyhttp/content-disposition'
import destroy from 'destroy'
import onFinished from 'on-finished'

const filePath = '/path/to/public/plans.pdf'

createServer((req, res) => {
  // set headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', create(path.basename(filePath)))

  // send file
  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
  onFinished(res, () => destroy(stream))
})
```

## License

MIT. Based on `content-disposition`, copyright (c) 2014-2017 Douglas Christopher
Wilson.
