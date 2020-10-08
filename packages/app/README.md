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

const app = new App()

app
  .use(function someMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log('Did a request')
    next()
  })
  .get('/', (_, res) => {
    res.send('<h1>Hello World</h1>')
  })
  .get('/page/:page/', (req, res) => {
    res.status(200).send(`You just opened ${req.params.page}`)
  })
  .listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)
