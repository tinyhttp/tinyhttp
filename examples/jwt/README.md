# Auth example

Simple authentication example using [JWT](https://jwt.io/) and tinyhttp.

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
