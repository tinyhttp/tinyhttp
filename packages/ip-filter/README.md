# @tinyhttp/cors

[![npm (scoped)][badge-url]][npm-url] [![npm][dl-badge-url]][npm-url]

IP Filtering middleware to send 403 on bad IPs.

## Install

```sh
pnpm i @tinyhttp/ip-filter
```

## API

```ts
import { ipFilter } from '@tinyhttp/ip-filter'
```

### `ipFilter(options)`

Returns the IP filter middleware.

#### Options

- `ip` - IP to use. Defaults to `req.ip`
- `strict`: throw if invalid IP
- `filter`: blacklist filter (array of strings / RegExps)
- `forbidden`: custom 403 message response

## Example

```ts
import { App } from '@tinyhttp/app'
import { ipFilter } from '@tinyhttp/ip-filter'

const app = new App()

app.use(ipFilter({ forbidden: 'Get the fuck out of my server!', filter: [`*.example.com`], strict: true }))

app.get('/', (req, res) => {
  res.send('The headers contained in my response are defined in the cors middleware')
})

app.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)

[badge-url]: https://img.shields.io/npm/v/@tinyhttp/cors?style=flat-square
[npm-url]: https://npmjs.com/package/@tinyhttp/cors
[dl-badge-url]: https://img.shields.io/npm/dt/@tinyhttp/cors?style=flat-square
