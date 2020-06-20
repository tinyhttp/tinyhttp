# @tinyhttp/cors

tinyhttp CORS module

## Installation

```sh
npm install @tinyhttp/cors
```

## API

```js
import { cors } from '@tinyhttp/cors'
```

### Options

#### `host`

Host that is allowed to send cross-origin requests. Defaults to '\*'.

#### `methods`

Allowed methods for performing a cross-origin request. Default ones are `['GET', 'POST', 'PUT', 'PATCH', 'HEAD']` and can be accessed with `defaultMethods`:

```ts
import { App } from '@tinyhttp/app'
import { defaultMethods, cors } from '@tinyhttp/cors'

const app = new App()

app.use(
  cors({
    methods: defaultMethods.filter(m => m !== 'DELETE'),
    host: 'https://example.com'
  })
)
```

#### `headers`

Allowed HTTP headers that can be sent in a cross-origin request. Default ones are `['Origin', 'X-Requested-With', 'Content-Type']` and can be accessed with `defaultHeaders`:

```ts
import { App } from '@tinyhttp/app'
import { defaultHeaders, cors } from '@tinyhttp/cors'

const app = new App()

app.use(
  cors({
    methods: [...defaultHeaders, 'X-Custom-Header'],
    host: 'https://example.com'
  })
)
```

## Example

```ts
import { App } from '@tinyhttp/app'
import { cors } from '@tinyhttp/cors'

const app = new App()

app
  .use(
    cors({
      host: 'https://example.com'
    })
  )
  .get('/', (_, res) => void res.end('Hello World'))
```

## License

MIT
