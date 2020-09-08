<link rel="stylesheet" href="/css/docs.css" />
<link rel="stylesheet" href="/css/shared.css" />
<link rel="stylesheet" href="/inter.css" />
<link rel="stylesheet" href="/hljs.css" />

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<meta property="og:title" content="tinyhttp">
<meta property="og:site_name" content="tinyhttp.v1rtl.site">
<meta property="og:url" content="https://tinyhttp.v1rtl.site">
<meta
      name="description"
      content="tinyhttp is a modern Express-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy hell."
    />
<meta property="og:description" content="tinyhttp is a modern Express-like web framework for Node.js. It uses a bare minimum amount of dependencies trying to avoid legacy hell.">
<meta property="og:type" content="website">
<meta property="og:image" content="https://tinyhttp.v1rtl.site/cover.jpg">

<title>Learn | tinyhttp</title>

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
  </ul>
  <a href="#advanced-topics"><h2>Advanced topics</h2></a>
</aside>

<main>

# Learn

## Get started

### Introduction

_**tinyhttp**_ is a modern Express-like web framework for Node.js written in TypeScript. It uses a bare minimum amount of dependencies trying to avoid legacy hell. Most dependencies that tinyhttp app has, are modern rewrites (like [regexparam](https://github.com/lukeed/regexparam)) or small 0-dependency modules, like [range-parser](https://www.npmjs.com/package/range-parser).

### Differences with Express

Although tinyhttp tries to be as close to Express as possible, there are some key differences between these two frameworks.

- **tinyhttp doesn't have the same settings**. All `App` settings are initialized in the constructor. You can see a list of them [here](/docs#constructor).
- **tinyhttp doesn't put `err` object in middleware if the previous one passed error**. Instead, it uses a [generic error handler](/docs#onerrorerr-req-res).
- **tinyhttp doesn't include static server and body parser out of the box**. To reduce module size these things were put in separate middleware modules, such as [`@tinyhttp/static`](https://tinyhttp.v1rtl.site/mw/static) and [`parsec`](https://github.com/talentlessguy/parsec).

Note that maximum compatability is in progress so some of the points might change.

See [Migration from Express](#migrationfromexpress) section to learn how to move from Express to tinyhttp.

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

Wrapping into `try...catch` works on both sync and async handlers.

</main>
