# LowDB example

A simple posts app using tinyhttp and [LowDB](https://github.com/typicode/lowdb).

## Setup

### Install dependencies

```sh
pnpm install
```

## Run

```sh
node index.js
```

## Endpoints

`GET /` will return all available posts

`GET /:id` will return a post with specified id

`POST /` will insert a new post using the `title` query

`PUT /:id` will like a post with specified id

`DELETE /:id` will delete a post with specified id
