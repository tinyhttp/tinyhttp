# GraphQL example

Basic [GraphQL](https://graphql.org) API with tinyhttp and [express-graphql](https://github.com/graphql/express-graphql).

## Setup

```sh
tinyhttp new graphql
```

## Run

```sh
node index.js
```

Open [GraphiQL](http://localhost:3000/graphql) in the browser, or try with `curl`:

```sh
curl 'http://localhost:3000/graphql?query={%0A++hello%0A}'
```
