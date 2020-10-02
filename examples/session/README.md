# Auth (Session) example

Simple authentication example with a session cookie using [@tinyhttp/session](https://tinyhttp.v1rtl.site/mw/session)

## Setup

```sh
pnpm install
```

## Run

```sh
node index.js
```

And in another terminal:

1. To login

```sh
curl -d "user=admin&pwd=admin" -v http://localhost:3000/login
```

From the response of the above command, note the value of the `micro.sid` cookie value

2. To verify session (replace the cookie value obtained from the above output)

```sh
curl -H 'Cookie: micro.sid=COOKIE_VALUE_HERE' http://localhost:3000/admin
```
