# tinyhttp

work in progress

A tiny Express remake, written in TypeScript.

## Features

- Compatible with Express
- Built-in helpers for static, cors and logger
- Async routes
- Smaller size
- 0 legacy dependencies

## Example

```ts
import { App } from '@tinyhttp/app'
import logger from '@tinyhttp/logger'
import staticFolder from '@tinyhttp/static'

const app = new App()

app.all('/', (_, res) => res.send('<h1>Hello World</h1>'))

app.get('/:first/:second', (req, res) => {
  res.json({ URLParams: req.params, QueryParams: req.query })
})

app.use(staticFolder())

app.use(logger())

app.listen(3000)
```
