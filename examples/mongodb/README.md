# MongoDB example

A simple note app using tinyhttp and [MongoDB](https://www.mongodb.com).

## Setup

### Install dependencies

```sh
pnpm install
```

### Create a database

Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a new database and grab the URI string, then put `DB_URI=<URI>` in the `.env` file.

## Run

```sh
node index.js
```

## Endpoints

- `GET /notes` - list notes with 2 properties which are title and desc.

- `POST /notes` - create a post using the data from `title` and `desc` query

- `DELETE /notes` - delete a note with specified ID

- `PUT /notes` - update a note by ID
