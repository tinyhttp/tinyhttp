# CSRF middleware example

Simple tinyhttp app using [Malibu](https://github.com/tinyhttp/malibu) as the CSRF middleware

## Setup

### Install dependencies

```sh
tinyhttp new malibu
```

## Run

```sh
node index.js
```

## Endpoints

`GET /` will return CSRF token in form of `{ "token": "csrf token" }`

`POST /` will do everything else, but it's protected with CSRF token.

### Example request:

```sh
curl --header 'csrf-token: csrf_token_from_get_request' --request POST http://localhost:3000/
```
