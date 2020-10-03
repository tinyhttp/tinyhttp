<link rel="stylesheet" href="/css/docs.css" />
<link rel="stylesheet" href="/css/shared.css" />
<link rel="stylesheet" href="/inter.css" />
<link rel="stylesheet" href="/hljs.css" />

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="Learn 📚 | tinyhttp — 0-legacy, tiny & fast web framework as a replacement of Express">
<meta property="og:site_name" content="tinyhttp.v1rtl.site" >
<meta property="og:url" content="https://tinyhttp.v1rtl.site" >
<meta
  name="description"
  content="tinyhttp is a modern Express-like web framework written in TypeScript and compiled to native ESM, that uses a bare minimum amount of dependencies trying to avoid legacy hell.">
<meta
  property="og:description"
  content="tinyhttp is a modern Express-like web framework written in TypeScript and compiled to native ESM, that uses a bare minimum amount of dependencies trying to avoid legacy hell."
/>
<meta property="og:type" content="website" />
<meta property="og:image" content="https://tinyhttp.v1rtl.site/cover.jpg" >

<title>Learn 📚 | tinyhttp — 0-legacy, tiny & fast web framework as a replacement of Express</title>

<nav>
  <a href="/">Home</a>
  <a href="https://github.com/talentlessguy/tinyhttp/tree/master/examples" target="_blank" rel="noopener noreferrer">Examples</a>
  <a href="/learn">Learn</a>
  <a href="/docs">Docs</a>
  <a href="/mw">Middleware</a>
  <a href="/donate">Donate</a>
</nav>

<aside>
  <a href="#get-started"><h2>Get started</h2></a>
  <ul>
    <li><a href="#introduction">Introduction</a></li>
    <li><a href="#dependency-structure">Dependency structure</a></li>
    <li><a href="#differences-with-express">Differences with Express</a></li>
    <li><a href="#install">Install</a></li>
    <li><a href="#hello-world">Hello World</a></li>
  </ul>
  <a href="#main-concepts"><h2>Main concepts</h2></a>
  <ul>
   	<li><a href="#middleware">Middleware</a></li>
   	<li><a href="#routing">Routing</a></li>
    <li><a href="#subapps">Subapps</a></li>
    <li><a href="#error-handling">Error handling</a></li>
    <li><a href="#template-engines">Template engines</a></li>
  </ul>
  <a href="#common-tasks"><h2>Common tasks</h2></a>
  <ul>
    <li><a href="#static-server">Static server</a></li>
    <li><a href="#template-engine">Template engine</a></li>
    <li><a href="#logger">Logger</a></li>
    <li><a href="#session">Session</a></li>
  </ul>
  <a href="#advanced-topics"><h2>Advanced topics</h2></a>
  <ul>
    <li><a href="#database-integration">Database integration</a></li>
    <li><a href="#deployment">Deployment</a></li>
  </ul>
</aside>

<main>

# Learn

## Get started

### Introduction

_**tinyhttp**_ is a modern Express-like web framework for Node.js written in TypeScript. It uses a bare minimum amount of dependencies trying to avoid legacy hell. Besides a small dependency list, tinyhttp also offers native ESM (`import` / `export`) support, async middleware handlers support and proper types out of the box.

Also, because a lot of express middlewares depend on legacy modules themselves, tinyhttp offers a [list of tinyhttp-oriented middleware](https://tinyhttp.v1rtl.site/mw) (with types out of the box and native ESM support as well) for the best development experience.

### Dependency structure

tinyhttp directly mostly depends on helper modules:

```sh
@tinyhttp/app 0.4.2
├── @tinyhttp/cookie 0.4.0
├── @tinyhttp/req 0.4.0
├── @tinyhttp/res 0.4.1
├── @tinyhttp/router 0.4.0
└── proxy-addr 2.0.6
```

The core `@tinyhttp/app` module depends on small helper modules like `@tinyhttp/router` for easier maintaining and ability to use tinyhttp features outside of tinyhttp (to build your own web framework for example).

this is how the full dependency tree of `@tinyhttp/app` looks like:

```sh
@tinyhttp/app 0.4.2
├── @tinyhttp/cookie 0.4.0
├─┬ @tinyhttp/req 0.4.0
│ ├─┬ @tinyhttp/accepts 0.4.0
│ │ ├─┬ es-mime-types 0.0.16
│ │ │ └── mime-db 1.45.0
│ │ └── negotiator 0.6.2
│ ├─┬ @tinyhttp/type-is 0.4.0
│ │ ├─┬ es-mime-types 0.0.16
│ │ │ └── mime-db 1.45.0
│ │ └── media-typer 1.1.0
│ ├─┬ @tinyhttp/url 0.4.0
│ │ └── regexparam 1.3.0
│ ├── es-fresh 0.0.8
│ └── range-parser 1.2.1
├─┬ @tinyhttp/res 0.4.1
│ ├── @tinyhttp/content-disposition 0.4.0
│ ├── @tinyhttp/cookie 0.4.0
│ ├── @tinyhttp/cookie-signature 0.4.0
│ ├─┬ @tinyhttp/req 0.4.0
│ │ ├─┬ @tinyhttp/accepts 0.4.0
│ │ │ ├─┬ es-mime-types 0.0.16
│ │ │ │ └── mime-db 1.45.0
│ │ │ └── negotiator 0.6.2
│ │ ├─┬ @tinyhttp/type-is 0.4.0
│ │ │ ├─┬ es-mime-types 0.0.16
│ │ │ │ └── mime-db 1.45.0
│ │ │ └── media-typer 1.1.0
│ │ ├─┬ @tinyhttp/url 0.4.0
│ │ │ └── regexparam 1.3.0
│ │ ├── es-fresh 0.0.8
│ │ └── range-parser 1.2.1
│ ├─┬ @tinyhttp/send 0.4.1
│ │ ├── @tinyhttp/etag 0.4.0
│ │ ├── es-content-type 0.0.10
│ │ └─┬ es-mime-types 0.0.16
│ │   └── mime-db 1.45.0
│ ├─┬ es-mime-types 0.0.16
│ │ └── mime-db 1.45.0
│ ├── es-vary 0.0.7
│ └── escape-html 1.0.3
├── @tinyhttp/router 0.4.0
└─┬ proxy-addr 2.0.6
  ├── forwarded 0.1.2
  └── ipaddr.js 1.9.1
```

Because Express contains a lot of legacy modules, the dependency tree of it is much longer.

> NOTE: Moving [proxy-addr](https://github.com/jshttp/proxy-addr) to tinyhttp's ES version is in progress

### Differences with Express

Although tinyhttp tries to be as close to Express as possible, there are some key differences between these two frameworks.

- **tinyhttp doesn't have the same settings**. All `App` settings are initialized in the constructor. You can see a list of them [here](/docs#settings).
- **tinyhttp doesn't put `err` object in middleware if the previous one passed error**. Instead, it uses a [generic error handler](/docs#onerrorerr-req-res).
- **tinyhttp doesn't include static server and body parser out of the box**. To reduce module size these things were put in separate middleware modules, such as [`parsec`](https://github.com/talentlessguy/parsec).

Note that maximum compatability is in progress so some of the points might change.

### Install

tinyhttp requires [Node.js 12.4.0 or newer](https://node.green/#ES2019) or newer. It is recommended to use [pnpm](https://pnpm.js.org/) because tinyhttp reuses modules in some middlewares.

You can quickly setup a working app using [fnm](https://github.com/Schniz/fnm) and [pnpm](https://pnpm.js.org/):

```sh
# Install fnm
curl -fsSL https://github.com/Schniz/fnm/raw/master/.ci/install.sh | bash

# Install latest Node.js version
fnm install latest
fnm use latest

# Create your app directory
mkdir app
cd app

# Init npm package (with ESM support)
echo '{ "type": "module" }' > package.json

# Install `app` module
pnpm i @tinyhttp/app

# Create the JavaScript file
touch app.js

# Run your app
node app.js
```

### Hello World

Here is a very basic example of a tinyhttp app:

```js
import { App } from '@tinyhttp/app'

const app = new App()

app.use((req, res) => {
  res.send('Hello world!')
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
```

For more examples check [examples folder](https://github.com/talentlessguy/tinyhttp/blob/master/examples) in tinyhttp repo.

## Main concepts

### Application

A tinyhttp app is an instance of `App` class containing middleware and router methods.

```js
import { App } from '@tinyhttp/app'

const app = new App()

app.use((req, res) => res.send('Hello World'))

app.listen(3000)
```

App settings can be set inside a constructor.

```js
const app = new App({
  noMatchHandler: (req, res) => res.send('Oopsie, page cannot be found'),
})
```

### Middleware

Middleware is a an object containing a handler function and a path (optionally), just like in Express.

```js
app
  .use((req, _res, next) => {
    console.log(`Made a request from ${req.url}!`)
    next()
  })
  .use((_req, res) => void res.send('Hello World'))
```

#### Handler

Handler is a function that accepts `Request` and `Response` object as arguments. These objects are extended versions of built-in `http`'s `IncomingMessage` and `ServerResponse`.

```js
app.use((req, res) => {
  res.send({ query: req.query })
})
```

For a full list of of those extensions, check the [docs](/docs).

#### Path

the request URL starts with the specified path, the handler will process request and response objects. Middleware only can handle URLs that start with a specified path. For advanced paths (with params and exact match), go to [Routing](#routing) section.

```js
app.use('/', (_req, _res, next) => void next()) // Will handle all routes
app.use('/path', (_req, _res, next) => void next()) // Will handle routes starting with /path
```

`path` argument is optional (and defaults to `/`), so you can put your handler function as the first argument of `app.use`.

#### Chaining

tinyhttp app returns itself on any `app.use` call which allows us to do chaining:

```js
app.use((_) => {}).use((_) => {})
```

Routing functions like `app.get` support chaining as well.

#### Execution order

All middleware executes in a loop. Once a middleware handler calls `next()` tinyhttp goes to the next middleware until the loop finishes.

```js
app.use((_req, res) => void res.end('Hello World')).use((_req, res) => void res.end('I am the unreachable middleware'))
```

Remember to call `next()` in your middleware chains because otherwise it will stick to a current handler and won't switch to next one.

### Routing

_**Routing**_ is defining how your application handles requests using with specific paths (e.g. `/` or `/test`) and methods (`GET`, `POST` etc).

Each route can have one or many middlewares in it, which handle when the path matches the request URL.

Routes usually have the following structure:

```js
app.METHOD(path, handler, ...handlers)
```

Where `app` is tinyhttp `App` instance, `path` is the path that should match the request URL and `handler` (+ `handlers`) is a function that is executed when the specified paths matches the request URL.

```js
import { App } from '@tinyhttp/app'

const app = new App()

app.get('/', (_req, res) => void res.send('Hello World'))
```

#### Router functions

Most popular methods (e.g. `GET`, `POST`, `PUT`, `OPTIONS`) have pre-defined functions for routing. In the future releases of tinyhttp all methods will have their functions.

```js
app.get('/', (_req, res) => void res.send('Hello World')).post('/a/b', (req, res) => void res.send('Sent a POST request'))
```

To handle all HTTP methods, use `app.all`:

```js
app.all('*', (req, res) => void res.send(`Made a request on ${req.url} via ${req.method}`))
```

#### Route paths

Route paths, in combination with a request method, define the endpoints at which requests can be made. Route paths can be strings, string patterns, or regular expressions (not yet).

> tinyhttp uses a [regexparam](https://github.com/lukeed/regexparam) module to do route matching. For more information about routing patterns, check its README.

Note that query strings (symbols after last `?` in request URL) are stripped from the path.

Here are some examples of route paths based on strings.

This route path will match requests to the root route, /.

```js
app.get('/', function (req, res) {
  res.send('root')
})
```

This route path will match requests to /about.

```js
app.get('/about', function (req, res) {
  res.send('about')
})
```

This route path will match requests to /random.text.

```js
app.get('/random.text', function (req, res) {
  res.send('random.text')
})
```

This route path will match acd and abcd.

```js
app.get('/ab?cd', function (req, res) {
  res.send('ab?cd')
})
```

##### Route parameters

Route parameters are named URL segments that are used to capture the values specified at their position in the URL. The captured values are populated in the `req.params` object, with the name of the route parameter specified in the path as their keys.

```
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
```

To define routes with route parameters, simply specify the route parameters in the path of the route:

```js
app.get('/users/:userId/books/:bookId', (req, res) => void res.send(req.params))
```

#### Route handlers

You can provide multiple callback functions that behave like [middleware](#middleware) to handle a request. The only exception is that these callbacks might invoke `next()` to bypass the remaining route callbacks. You can use this technique to conditionally switch or skip middlewares when it's not required anymore to stay in the current middleware.

Route handlers can be in the form of a function or a list of functions, as shown in the following examples.

A single callback function can handle a route. For example:

```js
app.get('/example/a', (req, res) => {
  res.send('Hello from A!')
})
```

More than one callback function can handle a route (make sure you specify the `next` function). For example:

```js
app.get(
  '/example/b',
  (req, res, next) => {
    console.log('the response will be sent by the next function ...')
    next()
  },
  (req, res) => {
    res.send('Hello from B!')
  }
)
```

An list of callback functions can handle a route. For example:

```js
const one = (req, res, next) => {
  console.log('Callback one!')
  next()
}

const two = (req, res, next) => {
  console.log('Callback two!')
  next()
}

const three = (req, res) => {
  res.send('Hello from Callback three!')
}

app.get('/example/c', cb0, cb1, cb2)
```

### Subapps

You can use tinyhttp's `App`s to create a modular group of handlers and then bind them to another "main" App.

Each app has it's own pack of middleware, settings and locales in it. Currently the support is experimental and probably will not work as expected (not all cases are tested yet), but you still could try it:

```js
import { App } from '@tinyhttp/app'

const app = new App()

const subApp = new App()

subApp.get('/route', (req, res) => void res.send(`Hello from ${subApp.mountpath}`))

app.use('/subapp', subApp).listen(3000)

// localhost:3000/subapp/route will send "Hello from /subapp"
```

### Error handling

To handle errors created during handler execution (inside `app.METHOD`) you should use `try { ... } catch (e) { ... }` structure and pass the error to `next`. In this case, the app will keep running but an internal server error will be sent in response. You can also log the error in the console to get more info about it.

```js
import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'

const app = new App({
  // Custom error handler
  onError: (err, _req, res) => {
    console.log(err)
    res.status(500).send(`Something bad happened`)
  },
})

app.get('/', async (_, res, next) => {
  let file

  // Wrap critical part into try...catch
  try {
    file = await readFile(`non_existent_file`)
  } catch (e) {
    // Pass error object to next() function
    next(e)
  }
  res.send(file.toString())
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
```

Wrapping into `try...catch` works with both sync and async handlers.

### Template engines

Starting from v0.2.70, tinyhttp supports template engines and provides special methods to work with them, such as [`app.engine`](/docs#appengine), [`app.render`](/docs#apprender) and [`res.render`](/docs#resrender).

Anything that can be wrapped in this function:

```ts
function engine(file: string, data, options, callback: (err: unknown, html: unknown) => void) {
  // ...
}
```

can be used as a middleware.

In order to use an engine, you should first register it so later the render function can be used inside tinyhttp.

```js
import { App } from '@tinyhttp/app'
import eta from 'eta'

const app = new App()

app.engine('eta', eta.renderFile) // maps app.engines['eta'] to eta.renderFile function
```

And now we can render any template file using `res.render`:

```js
import { App } from '@tinyhttp/app'
import eta from 'eta'

const app = new App()

app.engine('eta', eta.renderFile)

app.use((_, res) => void res.render('index.eta', { name: 'Eta' }))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
```

## Common tasks

As a rule, when you develop web applications, a web framework is not enough. This section will show some of the options to solve common problems, such as static serving, logging, etc.

### Static server

- [sirv](https://github.com/lukeed/sirv) - An optimized middleware & CLI application for serving static files
- [serve-handler](https://github.com/vercel/serve-handler) - The foundation of `serve`
- [serve-static](https://github.com/expressjs/serve-static) - Serve static files

### Template engine

- [Eta](https://eta.js.org/) - Embedded JS template engine for Node, Deno, and the browser. Lighweight, fast, and pluggable. Written in TypeScript
- [express-handlebars](https://github.com/ericf/express-handlebars) - A Handlebars view engine for Express which doesn't suck
- [EJS](https://github.com/tj/ejs) - Embedded JavaScript templates for node

### Logger

- [@tinyhttp/logger](https://tinyhttp.v1rtl.site/mw/logger) - Simple HTTP logger for tinyhttp
- [Pino](https://getpino.io) - super fast, all natural json logger
- [Zoya](https://github.com/WoLfulus/zoya) - Truly highly composable logging utility
- [Morgan](https://github.com/expressjs/morgan) - HTTP request logger middleware for Node.js
- [concurrency-logger](https://github.com/pablosichert/concurrency-logger) - Log HTTP requests/responses separately, visualize their concurrency and report logs/errors in context of a request
- [Volleyball](https://github.com/glebec/volleyball) - Tiny HTTP logger for Express showing asynchronous requests and responses

### Session

- [@tinyhttp/session](https://tinyhttp.v1rtl.site/mw/session) - Session middleware for tinyhttp. A rewrite of [micro-session](https://github.com/meyer9/micro-session).
- [express-session](https://github.com/expressjs/session) - Simple session middleware for Express
- [micro-session](https://github.com/meyer9/micro-session) - Session middleware for micro
- [next-session](https://github.com/hoangvvo/next-session) - Simple promise-based session middleware for Next.js, micro, Express, and more
- [node-client-sessions](https://github.com/mozilla/node-client-sessions) - secure sessions stored in cookies

## Advanced topics

### Database integration

As any other web framework, tinyhttp works well with databases. There is a plenty of [examples](https://github.com/talentlessguy/tinyhttp/tree/master/examples) for tinyhttp, including MongoDB, FaunaDB, CouchDB and LowDB ones.

#### Example

Usually, in a tinyhttp app you initiatialize a client for your database and later query with it inside middlewares.

Here's a simple [example](https://github.com/talentlessguy/tinyhttp/tree/master/examples/mongodb) with MongoDB:

```js
import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import { urlencoded as parser } from 'milliparsec'
import mongodb from 'mongodb'
import assert from 'assert'

dotenv.config()

const app = new App()

let db
let coll

// create mongo client
const client = new mongodb.MongoClient(process.env.DB_URI, {
  useUnifiedTopology: true,
})

// connect to mongodb
client.connect(async (err) => {
  assert.notStrictEqual(null, err)
  console.log('successfully connected to MongoDB')
  db = client.db('notes')
  coll = db.collection('notes')
})

// get all notes
app.get('/notes', async (_, res, next) => {
  try {
    const r = await coll.find({}).toArray()
    res.send(r)
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/notes', parser())

// add new note
app.post('/notes', async (req, res, next) => {
  try {
    const { title, desc } = req.body
    const r = await coll.insertOne({ title, desc })
    assert.strictEqual(1, r.insertedCount)
    res.send(`Note with title of "${title}" has been added`)
  } catch (err) {
    next(err)
  }
})

app.listen(3000)
```

There are some of the middlewares for databases to be able to use a databases through `req.db` property but currently they are in progress. You still can use tinyhttp with any database, as shown in the example.

### Deployment

There are a lot of ways to deploy tinyhttp. You can use a serverless platform, or a VPS, or anything else that has Node.js runtime. We'll look into the most common ways and break them down.

#### Serverless

As for Serverless, you can pick any of the serverless platforms. Here is a table of some popular ones:

| **Platform**                          | **Free**       |
| ------------------------------------- | -------------- |
| [Heroku](https://heroku.com)          | Yes            |
| [Vercel (Lambda)](https://vercel.com) | Yes            |
| [AWS](https://aws.amazon.com)         | Yes (one year) |

You can check out the Vercel [example](https://github.com/talentlessguy/tinyhttp/tree/master/examples/vercel) in the tinyhttp repo.

If you know any of the good serverless platforms to deploy tinyhttp on, feel free to PR on the docs.

#### Self-hosted

There is a list of self-hosted serverless deployments tools that you can install on your VPS and use it, making it similar to "real" serverless.

| **Tool**                                           |
| -------------------------------------------------- |
| [Exoframe](https://github.com/exoframejs/exoframe) |

#### Custom

##### CI/CD

If you prefer doing customized deployments you can try to use a combination of a CI/CD service, process manager and a web server (or only of them).

**CI/CD**

| CI/CD                                                 | Free |
| ----------------------------------------------------- | ---- |
| [Github Actions](https://github.com/features/actions) | Yes  |
| [Travis](https://travis-ci.org)                       | Yes  |

Any CI will work for tinyhttp because it doesn't set any limits.

**Process managers / Unit systems**

| PM / Unit system                                | Cross-platform | Load balancer built-in2 |
| ----------------------------------------------- | -------------- | ----------------------- |
| [PM2](https://pm2.io)                           | Yes            | Yes                     |
| [systemd](https://systemd.io)                   | No             | No                      |
| [z1](https://github.com/robojones/z1)           | Yes            | Yes                     |
| [Forever](https://github.com/foreversd/forever) | Yes            | Yes                     |

As a rule, the target server runs on Linux. All of the major distros have [systemd](https://systemd.io). You can use it to create a service for your tinyhttp app.

The most popular process manager for Node.js is [PM2](https://pm2.io/). It has a clustering feature built-in so it's very easy to make your app multi-process. However, using pm2 is not required to have clustering. You can do the same with systemd but you'll need to use a [`cluster`](https://nodejs.org/api/cluster.html) module. Check the cluster [example](https://github.com/talentlessguy/tinyhttp/tree/master/examples/cluster) for more info.

**Web servers**

It is common to use a web server as reverse proxy from 3000 (or any other) port to 80 HTTP port. A web server also could be used for load balancing.

| Web server                       | Load balancer built-in | Docs                                                                                                                                      |
| -------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [nginx](https://nginx.com)       | Yes                    | [Load Balancing Node.js Application Servers with NGINX](https://docs.nginx.com/nginx/deployment-guides/load-balance-third-party/node-js/) |
| [Caddy](https://caddyserver.com) | Yes                    | [Caddy Reverse Proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)                                                    |

##### Docker

Docker has a lot of images to run a Node.js app in a container. One of the most popular images is [node](https://hub.docker.com/_/node/).

There are articles of deploying an Express / Node.js app with Docker. You can use these tutorials to deploy tinyhttp.

- [Run Express in Docker](https://dev.to/tirthaguha/run-express-in-docker-2o44)
- [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

</main>
