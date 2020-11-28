# @tinyhttp/rate-limit

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/rate-limit) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/rate-limit) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/rate-limit)

Basic rate-limiting middleware for tinyhttp. Used to limit repeated requests to public APIs and/or endpoints such as password reset.

## Install

```sh
pnpm i @tinyhttp/rate-limit
```

## Usage

```js
import { App } from '@tinyhttp/app'
import { rateLimit } from '@tinyhttp/rate-limit'

new App().get(
  'limited-route',
  rateLimit({
    max: 10,
    windowMs: 60 * 1000 // 1 minute
  }),
  (_, res) => res.send('Limited route')
)
```

## Options

| Name                       |                                     Type                                      |                  Default                   | Description                                                                                                                                                                                                                                                              |
| :------------------------- | :---------------------------------------------------------------------------: | :----------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **windowMs**               |                              <code>number</code>                              |                    5000                    | Timeframe for which requests are checked/remembered.                                                                                                                                                                                                                     |
| **max**                    | <code>number &#124; ((req: Request, res: Response) => Promise<number>)</code> |                     5                      | Max number of connections during windowMs before sending a 429 response.                                                                                                                                                                                                 |
| **message**                |                              <code>string</code>                              | Too many requests, please try again later. | Error message sent to user when max is exceeded.                                                                                                                                                                                                                         |
| **statusCode**             |                              <code>number</code>                              |                    249                     | HTTP status code returned when max is exceeded.                                                                                                                                                                                                                          |
| **skipFailedRequests**     |                             <code>boolean</code>                              |                   false                    | When set to true, failed requests won't be counted.                                                                                                                                                                                                                      |
| **skipSuccessfulRequests** |                             <code>boolean</code>                              |                   false                    | When set to true successful requests (response status < 400) won't be counted.                                                                                                                                                                                           |
| **keyGenerator**           |             <code>(req: Request, res: Response) => string</code>              |              (req) => req.ip               | Function used to generate keys.                                                                                                                                                                                                                                          |
| **shouldSkip**             |             <code>(req: Request, res: Response) => boolean</code>             |                () => false                 | Determine per request if it should be skipped by the middleware                                                                                                                                                                                                          |
| **onLimitReached**         |      <code>onLimitReached: (req: Request, res: Response) => void</code>       |                  () => {}                  | Function that is called the first time a user hits the rate limit within a given window.                                                                                                                                                                                 |
| **store**                  |                              <code>Store</code>                               |                MemoryStore                 | By default a MemoryStore is used. [Rate Limit Redis](https://www.npmjs.com/package/rate-limit-redis), [Rate Limit Memcached](https://www.npmjs.com/package/rate-limit-memcached) and [Rate Limit Mongo](https://www.npmjs.com/package/rate-limit-mongo) can be used too. |

## Alternatives

- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [node-rate-limiter](https://github.com/jhurliman/node-rate-limiter)
- [node-rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible)

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/rate-limit?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/rate-limit?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
