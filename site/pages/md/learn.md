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
  <a href="#differences-with-express">Differences with Express</a>
  <a href="#install">Install</a>
</aside>

<main>

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

```sh
# Install fnm
curl -fsSL https://github.com/Schniz/fnm/raw/master/.ci/install.sh | bash

# Install latest Node.js version
fnm install latest
fnm use latest

# Install `app` module
pnpm i @tinyhttp/app

# Run your app
node app.js
```

</main>
