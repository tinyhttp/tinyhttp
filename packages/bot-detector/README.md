# @tinyhttp/bot-detector

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/bot-detector) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/bot-detector) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/bot-detector)

Detect bots among users in your tinyhttp app. This middlewares is based on [isbot](https://github.com/pugjs/bot-detector).

Note that it doesn't differentiate "good" and "bad" bots, it only shows if a request comes from a bot (e.g. crawler) or from a real human.

## Install

```sh
pnpm i @tinyhttp/bot-detector
```

## API

### `botDetector()(req, res)`

This middleware adds 2 new properties, `isBot` and `botName`.

- `isBot` is a boolean which shows if the request is made by a bot
- `botName` is a string that shows the bot name in case `isBot` is true.

## Example

```ts
import { App } from '@tinyhttp/app'
import type { Response } from '@tinyhttp/app'
import { botDetector } from '@tinyhttp/bot-detector'
import type { RequestWithBotDetector } from '@tinyhttp/bot-detector'

app.use(botDetector())

const app = new App<any, RequestWithBotDetector, Response>()

app.use((req, res) => {
  res.send(req.isBot ? `Bot detected 🤖: ${req.botName}` : 'Hello World!')
})

app.listen(3000)
```

## License

MIT © [v1rtl](https://v1rtl.site)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/bot-detector?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/bot-detector?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
