# @tinyhttp/app

![](https://tinyhttp.v1rtl.site/cover.jpg)

The core of tinyhttp. Contains the `App`, `Request` and `Response`. Additionally, it provides special tinyhttp-specific types.

## Install

```sh
pnpm i @tinyhttp/app
```

## Example

```ts
import { App } from '@tinyhttp/app'
import type { Request, Response, NextFunction } from '@tinyhttp/app'

new App()
  .use(function ware(req: Request, res: Response, next: NextFunction) {
    console.log('Did a request')
    next()
  })
  .get('/', (_, res) => void res.send('<h1>Hello World</h1>'))
  .get('/page/:page', (req, res) => void res.status(200).send(`You opened ${req.params.page}`))
  .listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)
