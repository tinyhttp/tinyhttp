# @tinyhttp/unless

Unless middleware for tinyhttp that executes a middleware conditionally.

## Install

```sh
pnpm i @tinyhttp/unless
```

## API

### `unless(middleware, (UnlessMiddlewareOptions | CustomUnless))`

The `UnlessMiddlewareOptions` object can include:

- `method` - string or array of strings that describe forbidden http methods such as GET, POST, PUT etc...
- `path` - array of strings, Regex and objects that include `url` and `methods` properties, which will be compared against the request.
- `ext` - string or array of strings that describe forbidden path ends (e.g. in `/user/123` it will check against `/123`).

The `CustomUnless` is a function that receives a Request object and returns a boolean. The result of the function will determine if the execution of the middleware is skipped.

## Example

```ts
import { App } from '@tinyhttp/app'
import { unless } from '@tinyhttp/unless'
import { cors } from '@tinyhttp/cors'

const app = new App()

//cMethod example
app.use(unless(cors(),  { method: ['GET', 'POST'] }))

//cExt example
app.use(unless(cors(), { ext: '/public' }))

// Custom function example
app.use(unless(cors(), (req) => req.method === 'GET')

// Path example
app.use(unless(cors(), { path: ['/content/public', /user/, { url: '/public', methods: ['GET'] }] })


app.listen(3000)
```

## License

MIT © [shzmr](https://github.com/shzmr)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/unless?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/unless?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
