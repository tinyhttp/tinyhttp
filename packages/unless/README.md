# @tinyhttp/unless

Unless middleware for tinyhttp

## Install

```sh
pnpm i @tinyhttp/unless
```

## API

### `unless(<middleware>, options) || <middleware>.unless(options)`

This middleware executes a middleware conditionally.

The `options` object can include:
- `method` - string or array of strings that describe forbidden http methods such as GET, POST, PUT etc...
- `path` - array of strings, Regex and objects that include `url` and `methods` properties, which will be compared against the request.
- `ext` - string or array of strings that describe forbidden path ends (e.g. in `/user/123` it will check against `123`).
- `custom` - function that receives a Request object and returns a boolean. The result of the function will determine if the middleware executes.

If you pass an empty options object (or you don't pass at all), the middlewares will execute regularly.

## Example

```ts
import { App } from '@tinyhttp/app'
import type { Response } from '@tinyhttp/app'
import { unless } from '@tinyhttp/unless'
import { cors } from '@tinyhttp/cors'

const app = new App();

//You can do this
app.use(unless(cors(), {method: ['GET', 'POST']}));

//Or this
app.use(cors().unless({method: ['GET', 'POST']}));

//Path example
app.use(unless(cors(), {path: ['/public', /user/, {url: "/public", methods: ['GET']}]});


app.listen(3000);
```

## License

MIT © [v1rtl](https://v1rtl.site)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/req?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/req?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
