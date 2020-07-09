<link rel="stylesheet" href="/css/docs.css" />
<link rel="stylesheet" href="/css/shared.css" />
<link rel="stylesheet" href="/inter.css" />

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
    
  </ul>

</aside>

<main>

# Learn

## Get started

### Introduction

_**tinyhttp**_ is a modern Express-like web framework for Node.js written in TypeScript. It uses a bare minimum amount of dependencies trying to avoid legacy hell. Most dependencies that tinyhttp app has, are modern rewrites (like [regexparam](https://github.com/lukeed/regexparam)) or small 0-dependency modules, like [range-parser](https://www.npmjs.com/package/range-parser).

### Differences with Express

Although tinyhttp tries to be as close to Express as possible, there are some key differences between these two frameworks.

- **tinyhttp doesn't have settings**. Instead, you have to put them in `App` constructor.
- **tinyhttp doesn't put `err` object in middleware if the previous one passed error**. Instead, it uses a general error handler.
- **tinyhttp doesn't include static server and body parser out of the box**. To reduce module size these things were put in separate middleware modules.

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

# Init npm package
pnpm init -y

# Install `app` module
pnpm i @tinyhttp/app

# Run your app
node app.js
```

### Hello World

Here is a very basic example of a tinyhttp app:

```ts
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

A tinyhttp app is an instance of `App` class containing middleware and router methods. All middleware executes in a loop. Once a middleware handler calls `next()` tinyhttp goes to the next middleware until the loop finishes.

tinyhttp middleware is almost the same as Express, Connect or Polka. Each middleware contains a handler that has access to Request and Response objects. Both are extended for additional functionality like `req.params` and `res.send`.

Even though tinyhttp has a lot of Express extensions (not all yet), the application itself keeps being small.

</main>
