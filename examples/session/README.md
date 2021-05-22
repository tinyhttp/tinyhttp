# Auth (Session) example

Simple authentication example with a session cookie using [next-session](https://github.com/hoangvvo/next-session)

## Setup

```sh
tinyhttp new session
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

From the response of the above command, note the value of the `sid` cookie value

2. To verify session (replace the cookie value obtained from the above output)

```sh
curl -H 'Cookie: micro.sid=COOKIE_VALUE_HERE' http://localhost:3000/admin
```
