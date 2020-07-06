<link rel="stylesheet" href="docs.css" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

<nav>
  <a href="/">Home</a>
  <a href="https://github.com/talentlessguy/tinyhttp">GitHub</a>
  <a href="/learn">Learn</a>
  <a href="/docs">Docs</a>
  <a href="https://v1rtl.site/donate">Donate</a>
</nav>

<aside>
  <a href="#application"><h1>Application</h1></a>
  <h2>Properties</h2>
  <ul>
    <li><a href="#applocals">app.locals</a></li>
  </ul>
  <h2>Events</h2>
  <h2>Methods</h2>
  <ul>
    <li><a href="#appmethodpath-handler-handler">app.all</a></li>
    <li><a href="#appgetpath-handler-handler">app.get</a></li>
    <li><a href="#apppostpath-handler-handler">app.post</a></li>
    <li><a href="#appputpath-handler-handler">app.put</a></li>
    <li><a href="#appdeletepath-handler-handler">app.delete</a></li>
    <li><a href="#appusehandler-handler">app.use</a></li>
  </ul>
</aside>

# 0.1X API

> Note: tinyhttp is not yet finished. Therefore, documentation is incomplete.

## Application

The `app` object is the whole tinyhttp application with all the middleware, handlers and so on

```ts
import { App } from '@tinyhttp/app'

app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(3000)
```

The app object has methods for

- Routing HTTP requests; see for example, `app.METHOD` and `app.param`.
- **NOT IMPLEMENTED** Configuring middleware; see `app.route`.
- **NOT IMPLEMENTED** Rendering HTML views; see `app.render`.
- **NOT IMPLEMENTED** Registering a template engine; see `app.engine`.

The Express application object can be referred from the request object and the response object as `req.app`, and `res.app`, respectively.

### Properties

#### `app.locals`

The `app.locals` object has properties that are local variables within the application.

```ts
console.dir(app.locals.title)
// => 'My App'

console.dir(app.locals.email)
// => 'me@myapp.com'
```

Once set, the value of app.locals properties persist throughout the life of the application, in contrast with res.locals properties that are valid only for the lifetime of the request.

You can access local variables in templates rendered within the application. This is useful for providing helper functions to templates, as well as application-level data. Local variables are available in middleware via `req.app.locals` (see [req.app](#reqapp))

```ts
app.locals.title = 'My App'
app.locals.strftime = require('strftime')
app.locals.email = 'me@myapp.com'
```

### Events

Coming soon...

### Methods

#### `app.METHOD(path, handler, [...handler])`

Routes an HTTP request, where METHOD is the HTTP method of the request, such as GET, PUT, POST, and so on, in lowercase. Thus, the actual methods are app.get(), app.post(), app.put(), and so on.

##### Routing methods

- checkout
- copy
- delete
- get
- head
- lock
- merge
- mkactivity
- mkcol
- move
- m-search
- notify
- options
- patch
- post
- purge
- put
- report
- search
- subscribe
- trace
- unlock
- unsubscribe

#### `app.get(path, handler, [...handler])`

Routes HTTP GET requests to the specified path with the specified handler functions.

##### Example

```ts
app.post('/', (req, res) => {
  res.send(`${req.method || 'GET'} request to homepage`
})
```

#### `app.post(path, handler, [...handler])`

Routes HTTP POST requests to the specified path with the specified handler functions.

##### Example

```ts
app.post('/', (req, res) => {
  res.send(`${req.method || 'POST'} request to homepage`
})
```

#### `app.put(path, handler, [...handler])`

Routes HTTP PUT requests to the specified path with the specified handler functions.

##### Example

```ts
app.put('/', (req, res) => {
  res.send(`${req.method || 'PUT'} request to homepage`)
})
```

#### `app.delete(path, handler, [...handler])`

Routes HTTP DELETE requests to the specified path with the specified handler functions.

##### Example

```ts
app.put('/', (req, res) => {
  res.send(`${req.method || 'PUT'} request to homepage`)
})
```

#### `app.use(handler, [...handler])`

Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.

##### Description

A route will match any path that follows its path immediately with a `/`. For example: `app.use('/apple', ...)` will match `/apple`, `/apple/images`, `/apple/images/news`, and so on.

Since path defaults to `/,` middleware mounted without a path will be executed for every request to the app.
For example, this middleware function will be executed for every request to the app:

```ts
app.use(function (req, res, next) {
  console.log('Time: %d', Date.now())
  next()
})
```

Middleware functions are executed sequentially, therefore the order of middleware inclusion is important.

```ts
// this middleware will not allow the request to go beyond it
app.use(function (req, res, next) {
  res.send('Hello World')
})

// requests will never reach this route
app.get('/', function (req, res) {
  res.send('Welcome')
})
```
