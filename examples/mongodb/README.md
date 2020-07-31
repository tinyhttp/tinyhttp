# MongoDB example

A simple note app using tinyhttp and [MongoDB](https://www.mongodb.com).

## Setup

### Install dependencies

```sh
pnpm install
```

### Create a database

Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a new database and grab the URI string, then put it in the `.env` file.

## Run

```sh
node index.js
```

## Endpoints

`GET /notes` will return a list of notes with 2 properties which are title and desc.

`POST /notes` will add a post using the data from `title` and `desc` query

`DELETE /notes` will delete a note with specified id

`PUT /notes` requires and ID of the item that you want to update as well as the title and desc for the updated one.
