# Neo4j example

A simple app using tinyhttp and [neo4j](https://neo4j.com/docs/).

## Setup

```sh
tinyhttp new neo4j
```
## Run
To run Neo4j database use this command:
```
docker-compose up -d
```
Once you're in the Neo4j UI, enter neo4j as password and set testing as a new password. Then, when you're logged in, type `:play person` in the editor and press the play button on the right.

Go to step 2 and click on the query to load it in the editor, then press the play button on the right to run the query.

```
CREATE (p:Person { Name : "Dylan" }), CREATE (p:Person { Name : "Inaê" })
```
Now that we have some data to query!

To run tinyhttp server run this command:
```sh
pnpm start
```
