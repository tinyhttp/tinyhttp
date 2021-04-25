# [Deta](https://deta.sh) example

Simple todo example with tinyhttp and Deta Base.

## Setup

```sh
tinyhttp new deta
```

Then create an `.env` file with Deta Base API key:

```env
# .env
KEY=MY_KEY
```

## Run

```sh
node index.js
```

## Endpoints

- `GET /todos` - returns all the existing tasks.
- `POST /todos` - adds a new task to the database.
- `PUT /todos` - updates an existing task. Requires the items's `id` property along with the `task` and `date`.
- `DELETE /todos` - deletes an existing task. Requires the `id` property of the target item.
