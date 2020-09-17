# FaunaDB example

A simple products app with [FaunaDB](https://fauna.com) test data.

## Setup

### Install dependencies

```sh
pnpm install
```

### Create a database

Go to [FaunaDB dashboard](https://dashboard.fauna.com), create a new database using test data.

Create an API key from dashboard and put it into `.env` file with `DB_KEY=<variable>` variable.

## Run

```sh
node index.js
```

## Endpoints

- `GET /products` - get all products

- `GET /product/:name` - get a specific product by name

- `POST /product` - create a new product
