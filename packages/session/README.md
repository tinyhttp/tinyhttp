# @tinyhttp/session

[![npm (scoped)][npm-badge]](https://npmjs.com/package/@tinyhttp/session) [![npm][dl-badge]](https://npmjs.com/package/@tinyhttp/session) [![][web-badge]](https://tinyhttp.v1rtl.site/mw/session)

Session middleware for tinyhttp. A rewrite of [micro-session](https://github.com/meyer9/micro-session).

## Install

```sh
pnpm i @tinyhttp/session
```

## API

```js
import { SessionManager, MemoryStore } from '@tinyhttp/session'
```

### `SessionManager`

Creates a `getSession` async function to get session data from `req` and `res` and save them to `store`. Only `secret` option is required, all of the rest are optional. Inherits all options from `SessionOptions`.

### Options

See [express-session `session(options)`](https://github.com/expressjs/session#sessionoptions).

### `MemoryStore`

Simple in-memory store that implements `ExpressStore` (from `express-session` types). Not intended to use in production.

```js
const store = new MemoryStore()
```

#### `store.clear(cb)`

Clear all sessions.

#### `store.destroy(id, cb)`

Destroy a session by the given ID.

#### `store.get(id, cb)`

Fetch session by the given session ID.

#### `store.set(id, session, cb)`

Commit the given session associated with the given sessionId to the store.

#### `length(cb)`

Get number of active sessions.

#### `touch(id, session, cb)`

Touch the given session object associated with the given session ID.

## Example

```js
import { App } from '@tinyhttp/app'
import { SessionManager, MemoryStore } from '@tinyhttp/session'

const app = new App()

const store = new MemoryStore()
const getSession = SessionManager({
  store,
  secret: 'test'
})

app
  .use(async (req, res) => {
    // Get session data from req and res
    const session = await getSession(req, res)

    // Increment on every request and keep in memory
    if (!session.test) session.test = 1
    else session.test += 1

    res.json({ t: session.test })
  })
  .listen(3000)
```

## Alternatives

- [express-session](https://github.com/expressjs/session) - Simple session middleware for Express
- [micro-session](https://github.com/meyer9/micro-session) - Session middleware for micro
- [next-session](https://github.com/hoangvvo/next-session) - Simple promise-based session middleware for Next.js, micro, Express, and more
- [node-client-sessions](https://github.com/mozilla/node-client-sessions) - secure sessions stored in cookies

[npm-badge]: https://img.shields.io/npm/v/@tinyhttp/session?style=flat-square
[dl-badge]: https://img.shields.io/npm/dt/@tinyhttp/session?style=flat-square
[web-badge]: https://img.shields.io/badge/website-visit-hotpink?style=flat-square
