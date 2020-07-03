<link rel="stylesheet" href="/docs.css" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

<nav>
  <a href="/">Home</a>
  <a href="https://github.com/talentlessguy/tinyhttp">GitHub</a>
  <a href="https://tinyhttp.now.sh">Docs</a>
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
  <li><a href="#appallpath-handler">app.all</a></li>
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

#### `app.all(path, handler)`

This method is like the standard `app.METHOD()` methods, except it matches all HTTP verbs.

##### Arguments

###### `path`

The path for which the middleware function is invoked; can be any of:

- A string representing a path.
- A path pattern.
- A regular expression pattern to match paths.
- An array of combinations of any of the above.

###### `handler`

Handler functions; can be:

- A middleware function.
- A series of middleware functions (separated by commas).
- An array of middleware functions.
- A combination of all of the above.

Since router and app implement the middleware interface, you can use them as you would any other middleware function.

For examples, see [Middleware handler function examples]().

##### Examples

The following handler is executed for requests to /secret whether using GET, POST, PUT, DELETE, or any other HTTP request method:

```ts
app.all('/secret', (req, res) => {
  console.log('Accessing the secret section ...')
})
```

The `app.all()` method is useful for mapping “global” logic for specific path prefixes or arbitrary matches. For example, if you put the following at the top of all other route definitions, it requires that all routes from that point on require authentication, and automatically load a user.

```ts
app.all('*', requireAuthentication, loadUser)
```

Another example is white-listed “global” functionality. The example is similar to the ones above, but it only restricts paths that start with “/api”:

```ts
app.all('/api/*', requireAuthentication)
```
