# Auth example

Simple authentification example using [JWT](https://jwt.io/) and tinyhttp.

> Doesn't work yet because of [#25](https://github.com/talentlessguy/tinyhttp/issues/25)

## Setup

```sh
pnpm install
```

## Run

```sh
node index.js
```

And in another terminal:

```sh
curl -X POST -F "user=admin" -F "pwd=admin" http://localhost:3000
```
