# OpenAPI validator example

Example of how to use express-openapi-validate with tinyhttp

## Setup

```shell
pnpm install
```

## Run
```shell
node app.js
```

And then, in another terminal, run:
```sh
curl localhost:3000/v1/ping
curl localhost:3000/v1/pets?type=dog&limit=2
```