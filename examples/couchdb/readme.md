# CouchDB example

A simple Todo app using tinyhttp and [CouchDB Nano](https://github.com/apache/couchdb-nano)

> [Nano](https://github.com/apache/couchdb-nano) is the Offical Apache CouchDB library for [Node.js](https://nodejs.org/en/)

### Set up

```bash
pnpm install
```
<br>

> [Download the couchDB](https://docs.couchdb.org/en/stable/install/index.html) in your local machine and set up the local enviornment accordingly.

> Skip if you already have it installed;

### Run
```bash
node index.js
```


### Endpoints

- `GET /todos` -  returns all the existing tasks.
- `POST /todos` - adds a new task to the database.
- `PUT /todos` - updates an existing task. Requires the items's `_rev` property along with the `task` and `date`.
- `DELETE /todos` - deletes an existing task. Requires the `_id` and `_rev` property of the target item.
