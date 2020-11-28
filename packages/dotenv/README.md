# @tinyhttp/dotenv

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/dotenv?style=flat-square)](https://npmjs.com/package/@tinyhttp/dotenv) [![npm](https://img.shields.io/npm/dt/@tinyhttp/dotenv?style=flat-square)](https://npmjs.com/package/@tinyhttp/dotenv)

> A rewrite of [dotenv](https://github.com/motdotla/dotenv) module.

Dotenv is a 0-dependency module to load envinronmental variables from `.env` to `process.env`.

## Installation

```sh
pnpm i @tinyhttp/dotenv
```

## API

```ts
import * as dotenv from 'dotenv'
```

### `dotenv.config`

config will read your .env file, parse the contents, assign it to process.env, and return an Object with a parsed key containing the loaded content or an error key if it failed.

```ts
const result = dotenv.config()

if (result.error) {
  throw result.error
}

console.log(result.parsed)
```

#### Options

##### Path

**Default**: `path.resolve(process.cwd(), '.env')`

You may specify a custom path if your file containing environment variables is located elsewhere.

```ts
require('dotenv').config({ path: '/custom/path/to/.env' })
```

##### Encoding

**Default**: `utf8`

You may specify the encoding of your file containing environment variables.

```ts
require('dotenv').config({ encoding: 'latin1' })
```

##### Debug

**Default**: `false`

You may turn on logging to help debug why certain keys or values are not being set as you expect.

```ts
require('dotenv').config({ debug: process.env.DEBUG })
```

### `dotenv.parse`

The engine which parses the contents of your file containing environment variables is available to use. It accepts a String or Buffer and will return an Object with the parsed keys and values.

```ts
const dotenv = require('dotenv')
const buf = Buffer.from('BASIC=basic')
const config = dotenv.parse(buf) // will return an object
console.log(typeof config, config) // object { BASIC : 'basic' }
```

#### Rules

- `BASIC=basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- lines beginning with `#` are treated as comments
- empty values become empty strings (`EMPTY=` becomes `{EMPTY: ''}`)
- inner quotes are maintained (think JSON) (`JSON={"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)
- whitespace is removed from both ends of unquoted values (see more on [`trim`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)) (`FOO= some value` becomes `{FOO: 'some value'}`)
- single and double quoted values are escaped (`SINGLE_QUOTE='quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- single and double quoted values maintain whitespace from both ends (`FOO=" some value "` becomes `{FOO: ' some value '}`)
- double quoted values expand new lines (`MULTILINE="new\nline"` becomes

```
{MULTILINE: 'new
line'}
```

#### Options

##### Debug

**Default**: `false`

You may turn on logging to help debug why certain keys or values are not being set as you expect.

```ts
const dotenv = require('dotenv')
const buf = Buffer.from('hello world')
const opt = { debug: true }
const config = dotenv.parse(buf, opt)
// expect a debug message because the buffer is not in KEY=VAL form
```
