# Validator example

Example of request body validation using [fastest-validator](https://github.com/icebob/fastest-validator).

## Install

```sh
$ pnpm install
```

## Run

```sh
$ node index.js
```

- Valid request

```sh
$ curl localhost:3000 -d '{ "name": "Ivan", "status": true, "id": 1 }'
# Body is valid
```

- Invalid request

```sh
$ curl localhost:3000 -d '{ "some": "data" }'
# [
#   {
#     "type": "required",
#     "message": "The 'id' field is required.",
#     "field": "id"
#   },
#   {
#     "type": "required",
#     "message": "The 'name' field is required.",
#     "field": "name"
#   },
#   {
#     "type": "required",
#     "message": "The 'status' field is required.",
#     "field": "status"
#   }
# ]
```
