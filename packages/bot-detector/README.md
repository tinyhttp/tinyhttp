# @tinyhttp/bot-detector

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/bot-detector) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/bot-detector) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/bot-detector)

Detect bots among users in your tinyhttp app. This middlewares is based on [isbot](https://github.com/omrilotan/isbot).

Note that it doesn't differentiate "good" and "bad" bots, it only shows if a request comes from a bot (e.g. crawler) or from a real human.

## Install

```sh
pnpm i @tinyhttp/bot-detector
```

## API

### `botDetector()(req, res)`

This middleware adds 2 new getters, `isBot` and `botName`.

- `isBot` is a boolean which shows if the request is made by a bot
- `botName` is a string that shows the bot name in case `isBot` is true.

> Both getters are lazy and will not be calculated until needed

## Example

```ts
import { App } from '@tinyhttp/app'
import type { Response } from '@tinyhttp/app'
import { botDetector } from '@tinyhttp/bot-detector'
import type { RequestWithBotDetector } from '@tinyhttp/bot-detector'

new App<any, RequestWithBotDetector, Response>()
  .use(botDetector())
  .use((req, res) => {
    res.send(req.isBot ? `Bot detected 🤖: ${req.botName}` : 'Hello World!')
  })
  .listen(3000)
```

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/bot-detector?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/bot-detector?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
