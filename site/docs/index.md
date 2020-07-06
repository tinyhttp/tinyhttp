<link rel="stylesheet" href="/docs.css" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

<nav>
  <a href="/">Home</a>
  <a href="https://github.com/talentlessguy/tinyhttp">GitHub</a>
  <a href="/learn">Learn</a>
  <a href="/docs">Docs</a>
  <a href="https://v1rtl.site/donate">Donate</a>
</nav>

<aside>
  <a href="#application"><h2>Application</h2></a>
  <details>
    <summary>
    Constructor
    </summary>
    <ul>
      <li><a href="#nomatchhandlerreq-res">noMatchHandler</a></li>
      <li><a href="#onerrorerr-req-res">onError</a></li>
    </ul>
  </details>

  <details>
    <summary>Properties</summary>
    <ul>
      <li><a href="#applocals">app.locals</a></li>
    </ul>
  </details>

  <h3>Methods</h3>
  <ul>
    <li><a href="#appmethodpath-handler-handler">app.all</a></li>
    <li><a href="#appgetpath-handler-handler">app.get</a></li>
    <li><a href="#apppostpath-handler-handler">app.post</a></li>
    <li><a href="#appputpath-handler-handler">app.put</a></li>
    <li><a href="#appdeletepath-handler-handler">app.delete</a></li>
    <li><a href="#appusehandler-handler">app.use</a></li>
  </ul>
  <a href="#Request"><h2>Request</h2></a>
  <details>
    <summary>
      Properties
    </summary>
    <ul>
      <li><a href="#reqapp">req.app</a></li>
      <li><a href="#reqhostname">req.hostname</a></li>
      <li><a href="#reqquery">req.query</a></li>
      <li><a href="#reqroute">req.route</a></li>
      <li><a href="#reqparams">req.params</a></li>
      <li><a href="#reqprotocol">req.protocol</a></li>
      <li><a href="#reqsecure">req.secure</a></li>
      <li><a href="#reqxhr">req.xhr</a></li>
    </ul>
  </details>
 
  
</aside>

# 0.1X API

> Note: tinyhttp is not yet finished. Therefore, documentation is incomplete.

## Application

The `app` object is the whole tinyhttp application with all the middleware, handlers and so on

```ts
import { App } from '@tinyhttp/app'

const app = new App()

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

### Constructor

#### `noMatchHandler(req, res)`

Handler if none of the routes match. Should return 404 Not found.

Example:

```ts
import { App, Request, Response } from '@tinyhttp/app'

const app = new App({
  noMatchHandler: (req: Request, res: Response) => {
    res.status(404).end('Not found :(')
  }
})

app
  .get('/', (req, res) => {
    res.send('hello world')
  })
  .listen(3000)
```

#### `onError(err, req, res)`

A middleware to catch server errors. Error can be anything. Should return 500 Internal Server Error.

Example:

```ts
import { App, Request, Response } from '@tinyhttp/app'

const app = new App({
  onError: (err, req, res) => {
    res.status(500).send({
      message: err.message
    })
  }
})

app
  .get('/', (req, res) => {
    res.send('hello world')
  })
  .listen(3000)
```

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

Not all methods aren't added yet.

- get
- post
- put
- patch
- head
- delete
- options

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

## Request

### Properties

#### `req.app`

This property holds a reference to the instance of the tinyhttp application that is using the middleware.

Example:

```ts
app.get('/', (req, res) => {
  res.json({
    ...req.app.middleware
  })
})
```

#### `req.hostname`

Contains the hostname derived from either `Host` or `X-Forwarded-Host` HTTP header.

```ts
// Host: "example.com:3000"
console.dir(req.hostname)
// => 'example.com'
```

#### `req.query`

This property is an object containing a property for each query string parameter in the route.

```ts
// GET /search?q=tobi+ferret
console.dir(req.query.q)
// => "tobi ferret"

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
console.dir(req.query.order)
// => "desc"

console.dir(req.query.shoe.color)
// => "blue"

console.dir(req.query.shoe.type)
// => "converse"

// GET /shoes?color[]=blue&color[]=black&color[]=red
console.dir(req.query.color)
// => [blue, black, red]
```

#### `req.route`

Contains the currently-matched route, a string. For example:

```ts
app.get('/user/:id?', function userIdHandler(req, res) {
  console.log(req.route)
  res.send('GET')
})
```

Example output would be something like this:

```txt
{
  path: '/user/:id?',
  method: 'GET',
  handler: [Function: userIdHandler],
  tyoe: 'route'
}
```

#### `req.params`

This property is an object containing properties mapped to the named route “parameters”. For example, if you have the route `/user/:name`, then the “name” property is available as `req.params.name`. This object defaults to `{}`.

```ts
// GET /user/v1rtl

app.get('/user/:name', (req, res) => {
  res.end(`Hello ${req.params.name}!`)
})
// => v1rtl
```

#### `req.protocol`

Contains the request protocol string: either http or (for TLS requests) https. This property will use the value of the `X-Forwarded-Proto` header field if present. This header can be set by the client or by the proxy.

```ts
console.dir(req.protocol)
```

#### `req.secure`

A Boolean property that is true if a TLS connection is established. Equivalent to the following:

```ts
req.protocol === 'https'
```

#### `req.xhr`

A Boolean property that is true if the request’s `X-Requested-With` header field is “XMLHttpRequest”, indicating that the request was issued by a client library such as `fetch`.

```ts
console.dir(req.xhr)
// => true
```
