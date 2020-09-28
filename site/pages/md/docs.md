<link rel="stylesheet" href="/css/docs.css" />
<link rel="stylesheet" href="/css/shared.css" />
<link rel="stylesheet" href="/inter.css" />
<link rel="stylesheet" href="/hljs.css" />

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="Docs 📖 | tinyhttp — 0-legacy, tiny & fast web framework as a replacement of Express">
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

<title>Docs 📖 | tinyhttp — 0-legacy, tiny & fast web framework as a replacement of Express</title>

<nav>
  <a href="/">Home</a>
  <a href="https://github.com/talentlessguy/tinyhttp/tree/master/examples" target="_blank" rel="noopener noreferrer">Examples</a>
  <a href="/learn">Learn</a>
  <a href="/docs">Docs</a>
  <a href="/mw">Middleware</a>
  <a href="/donate">Donate</a>
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
      <li><a href="#appparent">app.parent</a></li>
    </ul>
  </details>

  <details>
  <summary>Methods</summary>
    <ul>
    <li><a href="#appmethod">app.METHOD</a></li>
    <li><a href="#appall">app.all</a></li>
    <li><a href="#appget">app.get</a></li>
    <li><a href="#apppost">app.post</a></li>
    <li><a href="#appput">app.put</a></li>
    <li><a href="#appdelete">app.delete</a></li>
    <li><a href="#appuse">app.use</a></li>
    <li><a href="#appengine">app.engine</a></li>
    <li><a href="#apprender">app.render</a></li>
    <li><a href="#apppath">app.path</a></li>
  </ul>
  </details>

<a href="#request"><h2>Request</h2></a>

  <details>
    <summary>
      Properties
    </summary>
    <ul>
      <li><a href="#reqhostname">req.hostname</a></li>
      <li><a href="#reqquery">req.query</a></li>
      <li><a href="#reqroute">req.route</a></li>
      <li><a href="#reqparams">req.params</a></li>
      <li><a href="#reqprotocol">req.protocol</a></li>
      <li><a href="#reqsecure">req.secure</a></li>
      <li><a href="#reqxhr">req.xhr</a></li>
      <li><a href="#reqfresh">req.fresh</a></li>
      <li><a href="#reqstale">req.stale</a></li>
      <li><a href="#reqip">req.ip</a></li>
      <li><a href="#reqips">req.ips</a></li>
      <li><a href="#subdomains">req.subdomains</a></li>
      <li><a href="#reqapp">req.app</a></li>
    </ul>
  </details>
 
 <details>
  <summary>Methods</summary>
  <ul>
    <li><a href="#reqaccepts">req.accepts</a></li>
    <li><a href="#reqacceptsencodings">req.acceptsEncodings</a></li>
    <li><a href="#reqacceptscharsets">req.acceptsCharsets</a></li>
    <li><a href="#reqget">req.get</a></li>  
  </ul>
 </details>

<a href="#response"><h2>Response</h2></a>

<details>
    <summary>
      Properties
    </summary>
    <ul>
    <li><a href="#resapp">res.app</a></li>
    </ul>
  </details>
 <details>
  <summary>Methods</summary>
  <ul>
    <li><a href="#rescookie">res.cookie</a></li>
    <li><a href="#resclearcookie">res.clearCookie</a></li>
    <li><a href="#resend">res.end</a></li>
    <li><a href="#resjson">res.json</a></li>
    <li><a href="#ressend">res.send</a></li>
    <li><a href="#resstatus">res.status</a></li>
    <li><a href="#ressendstatus">res.sendStatus</a></li>
    <li><a href="#ressendfile">res.sendFile</a></li>
    <li><a href="#resset">res.set</a></li>
    <li><a href="#reslinks">res.links</a></li>
    <li><a href="#reslocation">res.location</a></li>
    <li><a href="#resrender">res.render</a></li>
    <li><a href="#resvary">res.vary</a></li>
    <li><a href="#resformat">res.format</a></li>
    <li><a href="#resredirect">res.redirect</a></li>
    <li><a href="#restype">res.type</a></li>
    <li><a href="#resjsonp">res.jsonp</a></li>
  </ul>
 </details>
</aside>

<main>

# 0.X API

> Note: tinyhttp is not yet finished. Therefore, documentation is incomplete.

## Application

The `app` object is the whole tinyhttp application with all the middleware, handlers and settings.

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
- Rendering HTML views; see [`app.render`](#apprender).
- Registering a template engine; see [`app.engine`](#appengine).

The tinyhttp application object can be referred from the request object and the response object as `req.app`, and `res.app`, respectively.

### Constructor

#### `noMatchHandler(req, res)`

Handler if none of the routes match. Should return 404 Not found.

```ts
import { App, Request, Response } from '@tinyhttp/app'

const app = new App({
  noMatchHandler: (req: Request, res: Response) => {
    res.status(404).end('Not found :(')
  },
})

app
  .get('/', (req, res) => {
    res.send('hello world')
  })
  .listen(3000)
```

#### `onError(err, req, res)`

A middleware to catch server errors. Error can be anything. Should return 500 Internal Server Error.

```ts
import { App, Request, Response } from '@tinyhttp/app'

const app = new App({
  onError: (err, req, res) => {
    res.status(500).send({
      message: err.message,
    })
  },
})

app
  .get('/', (req, res) => {
    res.send('hello world')
  })
  .listen(3000)
```

#### `settings`

tinyhttp application has a list of settings to toggle various application parts. All of them are opted out by default to achieve the best performance (less extensions, better performance).

```ts
import { App } from '@tinyhttp/app'

const app = new App({
  settings: {
    networkExtensions: true,
  },
})

app.use((req, res) => void res.send(`Hostname: ${req.hostname}`)).listen(3000)
```

Here's a list of all of the settings:

- `networkExtensions` - network `req` extensions
- `freshnessTesting` - `req.fresh` and `req.stale` properties

##### `networkExtensions`

Enabled a list of Request object extensions related to network.

- [`req.protocol`](#reqprotocol)
- [`req.secure`](#reqsecure)
- [`req.hostname`](#reqhostname)
- [`req.ip`](#reqip)
- [`req.ips`](#reqips)
- [`req.subdomains`](#reqsubdomains)

##### `freshnessTesting`

Enables 2 properties - `req.fresh` and `req.stale`:

- [`req.fresh`](#reqfresh)
- [`req.stale`](#reqstale)

##### `subdomainOffset`

Subdomain offset for `req.subdomains`. Defaults to `2`.

##### `bindAppToReqRes`

Bind the app as a reference to the actual app to `req.app` and `res.app`. Disabled by default.

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

You can access local variables in templates rendered within the application. This is useful for providing helper functions to templates, as well as application-level data.

```ts
app.locals.title = 'My App'
app.locals.strftime = require('strftime')
app.locals.email = 'me@myapp.com'
```

#### `app.parent`

`app.parent` points to a parent `App` object, e.g. the app that was mounted to.

```js
const app = new App()

const subapp = new App()

app.use(subapp)

console.log(app.parent)

/*
<ref *1> App {
  middleware: [],
  mountpath: '/',
  apps: {
    '/': App {
      middleware: [],
      mountpath: '/',
      apps: {},
      parent: [Circular *1]
    }
  }
}
*/
```

### Events

Coming soon...

### Methods

#### `app.METHOD`

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

#### `app.all`

This method is like the standard [`app.METHOD()`](#appmethod) methods, except it matches all HTTP verbs.

The following callback is executed for requests to `/secret` whether using GET, POST, PUT, DELETE, or any other HTTP request method:

```ts
app.all('/secret', (req, res, next) => {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
})
```

The `app.all()` method is useful for mapping “global” logic for specific path prefixes or arbitrary matches. For example, if you put the following at the top of all other route definitions, it requires that all routes from that point on require authentication, and automatically load a user. Keep in mind that these callbacks do not have to act as end-points: loadUser can perform a task, then call `next()` to continue matching subsequent routes.

```ts
app.all('*', requireAuthentication, loadUser)
```

#### `app.get`

Routes HTTP GET requests to the specified path with the specified handler functions.

```ts
app.get('/', (req, res) => {
  res.send(`${req.method || 'GET'} request to homepage`
})
```

#### `app.post`

Routes HTTP POST requests to the specified path with the specified handler functions.

```ts
app.post('/', (req, res) => {
  res.send(`${req.method || 'POST'} request to homepage`
})
```

#### `app.put`

Routes HTTP PUT requests to the specified path with the specified handler functions.

```ts
app.put('/', (req, res) => {
  res.send(`${req.method || 'PUT'} request to homepage`)
})
```

#### `app.delete`

Routes HTTP DELETE requests to the specified path with the specified handler functions.

```ts
app.put('/', (req, res) => {
  res.send(`${req.method || 'PUT'} request to homepage`)
})
```

#### `app.use`

Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches path.

##### Description

A route will match any path that follows its path immediately with a `/`. For example: `app.use('/apple', ...)` will match `/apple`, `/apple/images`, `/apple/images/news`, and so on.

Since path defaults to `/,` middleware mounted without a path will be executed for every request to the app.
For example, this middleware function will be executed for every request to the app:

```ts
app.use((req, res, next) => {
  console.log('Time: %d', Date.now())
  next()
})
```

Middleware functions are executed sequentially, therefore the order of middleware inclusion is important.

```ts
// this middleware will not allow the request to go beyond it
app.use((req, res, next) => void res.send('Hello World'))

// requests will never reach this route
app.get('/', (req, res) => res.send('Welcome'))
```

#### `app.engine`

Register a template engine. Works with any Express template engines that contain a `renderFile` function.

```js
import { App } from '@tinyhttp/app'
import ejs from 'ejs'

const app = new App()

app.engine('ejs', ejs.renderFile) // map app.engines['ejs'] to ejs.renderFile
```

#### `app.render`

Render a file with the engine that was set previously via [`app.engine`](#appengine). To render and respond with the result, use [`res.render`](#resrender)

```js
import { App } from '@tinyhttp/app'
import ejs from 'ejs'

const app = new App()

app.engine('ejs', ejs.renderFile)

app.render(
  'index.ejs',
  { name: 'EJS' },
  (err, html) => {
    if (err) throw err
    doSomethingWithHTML(html)
  },
  {
    /* some options */
  }
)
```

Almost every engine is supported if it can render a single file. Some engines may have different arguments (for example Pug doesn't require a `data` object) but you can write a function to have the same arguments.

```js
import { App } from '@tinyhttp/app'
import pug from 'pug'

const app = new App()

const renderPug = (path, _, options, cb) => pug.renderFile(path, options, cb)

app.engine('pug', renderPug)

app.use((_, res) => void res.render('index.pug'))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
```

#### `app.path`

Returns the mountpath of the app.

```js
const app = new App()
const blog = new App()
const blogAdmin = new App()

app.use('/blog', blog)
blog.use('/admin', blogAdmin)

console.dir(app.path()) // ''
console.dir(blog.path()) // '/blog'
console.dir(blogAdmin.path()) // '/blog/admin'
```

## Request

The `req` object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on.

```ts
app.get('/user/:id', (req, res) => {
  res.send(`user ${req.params.id}`)
})
```

The req object is an enhanced version of Node.js built-in [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object.

### Properties

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
  type: 'route'
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

#### `req.fresh`

> This property can be enabled via `freshnessTesting` setting

When the response is still “fresh” in the client’s cache true is returned, otherwise false is returned to indicate that the client cache is now stale and the full response should be sent.

When a client sends the `Cache-Control: no-cache` request header to indicate an end-to-end reload request, this module will return false to make handling these requests transparent.

Further details for how cache validation works can be found in the [HTTP/1.1 Caching Specification](https://tools.ietf.org/html/rfc7234).

```ts
console.dir(req.fresh)
// => true
```

#### `req.stale`

> This property can be enabled via `freshnessTesting` setting

Indicates whether the request is “stale,” and is the opposite of `req.fresh`. For more information, see [`req.fresh`](#reqfresh).

```ts
console.dir(req.stale)
// => true
```

#### `req.ip`

Contains the remote IP address of the request.

```ts
console.log(req.ip)
// => '127.0.0.1'
```

#### `req.ips`

Contains an array of remote IP addresses of the request.

```ts
console.log(req.ip)
// => [127.0.0.1']
```

#### `req.subdomains`

> This property can be enabled via `networkExtensions` setting

Contains an array of subdomains. Subdomain offset can be set via `subdomainOffset`

```ts
console.log(req.hostname)
// dev.node0.example.com

console.log(req.subdomains)
// ['node0', 'dev']
```

#### `req.app`

> This property can be enabled via `bindAppToReqRes` setting

Points to a reference of the currently used app.

```ts
app.use((req, res) => {
  res.json(req.app.middleware) // send a current middleware array, dunno why but this is just an example
})
```

### Methods

#### `req.accepts`

Checks if the specified content types are acceptable, based on the request’s `Accept` HTTP header field. The method returns the best match, or if none of the specified content types is acceptable, returns `false` (in which case, the application should respond with `406 "Not Acceptable"`).

The type value may be a single MIME type string (such as `"application/json"`), an extension name such as `"json"`, a comma-delimited list, or an array. For a list or array, the method returns the _**best**_ match (if any).

```ts
// Accept: text/html
req.accepts('html')
// => "html"

// Accept: text/*, application/json
req.accepts('html')
// => "html"
req.accepts('text/html')
// => "text/html"
req.accepts(['json', 'text'])
// => "json"
req.accepts('application/json')
// => "application/json"

// Accept: text/*, application/json
req.accepts('image/png')
req.accepts('png')
// => false

// Accept: text/*;q=.5, application/json
req.accepts(['html', 'json'])
// => "json"
```

For more information, or if you have issues or concerns, see [accepts](https://github.com/jshttp/accepts).

#### `req.acceptsEncodings`

Returns the first accepted encoding of the specified encodings, based on the request’s Accept-Encoding HTTP header field. If none of the specified encodings is accepted, returns `false`.

#### `req.acceptsCharsets`

Returns the first accepted charset of the specified character sets, based on the request’s Accept-Charset HTTP header field. If none of the specified charsets is accepted, returns .`false`

#### `req.get`

Returns the specified HTTP request header field (case-insensitive match).

```ts
req.get('Content-Type')
// => "text/plain"

req.get('content-type')
// => "text/plain"

req.get('Something')
// => undefined
```

## Response

The `res` object represents the HTTP response that a tinyhttp app sends when it gets an HTTP request.

### Properties

#### `res.app`

> This property can be enabled via `bindAppToReqRes` setting

Points to a reference of the currently used app.

```js
app.use((req, res) => {
  res.json(res.app.settings)
})
```

### Methods

#### `res.cookie`

Sets cookie `name` to `value`. The `value` parameter may be a string or object converted to JSON.

The `options` parameter is an object that can have the following properties.

| Property   | Type                | Description                                                                                                                                  |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`   | `string`            | Domain name for the cookie. Defaults to the domain name of the app.                                                                          |
| `encode`   | `Function`          | A synchronous function used for cookie value encoding. Defaults to `encodeURIComponent`.                                                     |
| `expires`  | `Date`              | Expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie.                                                    |
| `httpOnly` | `boolean`           | Flags the cookie to be accessible only by the web server.                                                                                    |
| `maxAge`   | `number`            | Convenient option for setting the expiry time relative to the current time in milliseconds.                                                  |
| `path`     | `string`            | Path for the cookie. Defaults to “/”.                                                                                                        |
| `secure`   | `boolean`           | Marks the cookie to be used with HTTPS only.                                                                                                 |
| `signed`   | `boolean`           | Indicates if the cookie should be signed.                                                                                                    |
| `sameSite` | `boolean \| string` | Value of the “SameSite” Set-Cookie attribute. [More info](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1). |

> All `res.cookie()` does is set the HTTP Set-Cookie header with the options provided. Any option not specified defaults to the value stated in RFC 6265.

```ts
res.cookie('name', 'tobi', {
  domain: '.example.com',
  path: '/admin',
  secure: true,
})

// Enable "httpOnly" and "expires" parameters
res.cookie('rememberme', '1', {
  expires: new Date(Date.now() + 900000),
  httpOnly: true,
})
```

#### `res.clearCookie`

Clears the cookie specified by `name`. For details about the `options` object, see [`res.cookie()`](#rescookie).

> Web browsers and other compliant clients will only clear the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge.

```ts
res.cookie('name', 'tobi', { path: '/admin' })
res.clearCookie('name', { path: '/admin' })
```

#### `res.end`

Ends the response process. The method comes from [response.end() of http.ServerResponse.](https://nodejs.org/api/http.html#http_response_end_data_encoding_callback).

Can be used to send raw data or end the response without any data at all. If you need to respond with data with proper content type headers set and so on, instead use methods such as [`res.send()`](#ressend) and [`res.json()`](#resjson).

```ts
res.end()
res.status(404).end()
```

#### `res.json`

Sends a JSON response. This method sends a response (with the correct content-type) that is the parameter converted to a JSON string using [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

The parameter can be any JSON type, including object, array, string, boolean, number, or null, and you can also use it to convert other values to JSON.

```ts
res.json(null)
res.json({ user: 'tobi' })
res.status(500).json({ error: 'message' })
```

#### `res.send`

Sends the HTTP response.

The body parameter can be a `Buffer` object, a string, an object, or an array.

```ts
res.send(Buffer.from('whoop'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Sorry, we cannot find that!')
res.status(500).send({ error: 'something blew up' })
```

This method performs many useful tasks for simple non-streaming responses: For example, it automatically assigns the `Content-Length` HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.

When the parameter is a Buffer object, the method sets the `Content-Type` response header field to `"application/octet-stream"`, unless previously defined as shown below:

```ts
res.set('Content-Type', 'text/html')
res.send(Buffer.from('<p>some html</p>'))
```

When the parameter is a string, the method sets the `Content-Type` to `"text/html"`:

```ts
res.send('<p>some html</p>')
```

When the parameter is an Array or Object, Express responds with the JSON representation (same as [`res.json`](#resjson)):

```ts
res.send({ user: 'tobi' })
res.send([1, 2, 3])
```

#### `res.status`

Sets the HTTP status for the response. It is a chainable alias of Node’s `response.statusCode`.

```ts
res.status(403).end()
res.status(400).send('Bad Request')
```

#### `res.sendStatus`

Sets the response HTTP status code to statusCode and send its string representation as the response body.

```ts
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
```

If an unsupported status code is specified, the HTTP status is still set to statusCode and the string version of the code is sent as the response body.

```ts
res.sendStatus(9999) // equivalent to res.status(9999).send('9999')
```

#### `res.sendFile`

Sends a file by piping a stream to response. It also checks for extension to set a proper `Content-Type` header.

> Path argument must be absolute. To use a relative path, specify the `root` option first.

```js
res.sendFile('song.mp3', { root: process.cwd() }, (err) => console.log(err))
```

[More about HTTP Status Codes](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes)

#### `res.set`

Sets the response’s HTTP header `field` to `value`. To set multiple fields at once, pass an object as the parameter.

```ts
res.set('Content-Type', 'text/plain')

res.set({
  'Content-Type': 'text/plain',
  'Content-Length': '123',
  ETag: '12345',
})
```

Alias to `res.header`.

#### `res.links`

Joins the `links` provided as properties of the parameter to populate the response’s `Link` HTTP header field.

For example, the following call:

```ts
res.links({
  next: 'http://api.example.com/users?page=2',
  last: 'http://api.example.com/users?page=5',
})
```

Yields the following results:

```txt
Link: <http://api.example.com/users?page=2>; rel="next",
      <http://api.example.com/users?page=5>; rel="last"
```

#### `res.location`

Sets the response Location HTTP header to the specified path parameter.

```ts
res.location('/foo/bar')
res.location('http://example.com')
res.location('back')
```

A `path` value of `"back"` has a special meaning, it refers to the URL specified in the `Referer` header of the request. If the Referer header was not specified, it refers to `"/"`.

> After encoding the URL, if not encoded already, tinyhttp passes the specified URL to the browser in the `Location` header, without any validation. Browsers take the responsibility of deriving the intended URL from the current URL or the referring URL, and the URL specified in the Location header; and redirect the user accordingly.

#### `res.render`

Render a template using a pre-defined engine and respond with the result.

```js
import { App } from '@tinyhttp/app'
import ejs from 'ejs'

const app = new App()

app.engine('ejs', ejs.renderFile)

app.use((_, res) => void res.render('index.ejs', { name: 'EJS' }))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
```

#### `res.vary`

Adds the field to the Vary response header, if it is not there already.

```js
res.vary('User-Agent').render('docs')
```

#### `res.format`

Sends a conditional response based on the value in `Accept` header. For example, if `Accept` contains `html`, the HTML option will be sent.

```js
res.format({
  html: (req, res) => void res.send('<h1>Hello World for HTML</h1>')
  text: (req, res) => void res.send('Hello World for text')
})
```

and depending on the `Accept` header, it will send different responses:

```sh
curl -H "Accept: text/html" localhost:3000
# <h1>Hello World for HTML</h1>

curl localhost:3000
# Hello World for text
```

#### `res.redirect`

Redirect to a URL by sending a 302 (or any other) status code and `Location` header with the specified URL.

```js
res.redirect('/another-page')

// custom status
res.redirect('/some-other-page', 300)
```

#### `res.type`

Sets the `Content-Type` HTTP header to the MIME type as determined by [mime.lookup()](https://github.com/talentlessguy/es-mime-types/blob/master/src/index.ts#L123) for the specified type. If type contains the `/` character, then it sets the `Content-Type` to type.

```js
res.type('.html')
// => 'text/html'
res.type('html')
// => 'text/html'
res.type('json')
// => 'application/json'
res.type('application/json')
// => 'application/json'
res.type('png')
// => 'image/png'
```

#### `res.jsonp`

Send JSON response with JSONP callback support. `res.jsonp` isn't used that often so it's located in a separate package - [`@tinyhttp/jsonp`](https://github.com/talentlessguy/tinyhttp/blob/master/packages/jsonp)

Here's a way how to enable it:

```js
import { jsonp } from '@tinyhttp/jsonp'

app.use((req, res, next) => {
  res.jsonp = jsonp(req, res, app)
  next()
})

app.get('/', (req, res) => {
  res.jsonp({ some: 'jsonp' })
})
```

</main>
