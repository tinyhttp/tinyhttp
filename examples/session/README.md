# Auth (Session) example

Simple authentication example using tinyhttp/session.

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
