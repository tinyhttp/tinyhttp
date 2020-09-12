# @tinyhttp/cors

[![npm (scoped)][badge-url]][npm-url] [![npm][dl-badge-url]][npm-url]

> A rewrite of [expressjs/cors](https://github.com/expressjs/cors) module.

HTTP cors header middleware

## Install

```sh
pnpm i @tinyhttp/cors
```

## API

```ts
import { cors } from '@tinyhttp/cors'
```

### `cors(options)`

Returns the CORS middleware with the settings specified in the parameters

#### Options

- `origin`: Can be a string defining the `Access-Control-Allow-Origin` value, a boolean which if set to true sets the header to `'*'` or a function which contains the request and response as parameters and must return the value for the `Access-Control-Allow-Origin` header
- `methods`: Array of method names which define the `Access-Control-Allow-Methods` header, default to all the most common methods (`GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`)
- `allowedHeaders`: Configures the `Access-Control-Allow-Headers` CORS header. Expects an array (ex: [`'Content-Type'`, `'Authorization'`]).
- `exposedHeaders`: Configures the `Access-Control-Expose-Headers` CORS header. If not specified, no custom headers are exposed
- `credentials`: Configures the `Access-Control-Allow-Credentials` CORS header. Set to true to pass the header, otherwise it is omitted.
- `maxAge`: Configures the `Access-Control-Max-Age` CORS header. Set to an integer to pass the header, otherwise it is omitted.
- `optionsSuccessStatus`: Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.

The default configuration is:

```json
{
  "origin": "*",
  "methods": ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  "optionsSuccessStatus": 204
}
```

## Example

```ts
import { App } from '@tinyhttp/app'
import { cors } from '@tinyhttp/cors'

const app = new App()

app.use(cors({ origin: 'https://myfantastic.site/' }))
app.options('*', cors())

app.get('/', (req, res) => {
  res.send('The headers contained in my response are defined in the cors middleware')
})

app.listen(3000)
```

## Alternatives

- [cors](https://github.com/expressjs/cors)

## License

MIT © [BRA1L0R](https://brailor.me/)

[badge-url]: https://img.shields.io/npm/v/@tinyhttp/cors?style=flat-square
[npm-url]: https://npmjs.com/package/@tinyhttp/cors
[dl-badge-url]: https://img.shields.io/npm/dt/@tinyhttp/cors?style=flat-square
