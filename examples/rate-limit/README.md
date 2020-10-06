# Rate limit example

Basic example of using tinyhttp/rate-limit with tinyhttp.

The example creates a server with the routes /unlimited-route and /limited-route. /limited-route is rate limited. The server will block every further request after 5 tries for 10 seconds.

## Setup

```sh
pnpm install
```

## Run

```sh
pnpm start
```
