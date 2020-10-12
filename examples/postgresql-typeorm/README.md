# Postgresql example

A simple user app using tinyhttp and [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/).

## Setup

### Install dependencies

```sh
pnpm install
```

### Install PostgreSQL

[PostgreSQL Wiki](https://wiki.postgresql.org/wiki/Detailed_installation_guides) has a good list of guides for installing postgres on different operating systems.

### Create a database

Use [createdb](https://www.postgresql.org/docs/10/app-createdb.html#:~:text=createdb%20creates%20a%20new%20PostgreSQL,the%20SQL%20command%20CREATE%20DATABASE.) to create a database

```
createdb [dbname]
```

### Configure TypeORM

Setup database settings inside `ormconfig.json` file:

```
  ...
  "host": "localhost",
  "port": 5432,
  "username": "<username>",
  "password": "<password>",
  "database": "<database>",
  ...
```

## Run

```sh
pnpm start
```

## Endpoints

- `GET /users` - list users

- `GET /users/:id` - get user by id

- `POST /users` - create a user from a provided `name`

- `DELETE /users` - delete a user with specified id

- `PUT /users` - update a user by ID from a provided `name`
