# [Elasticsearch](https://www.elastic.co/elasticsearch/) example

A simple search and index app with an Elasticsearch backend

## Setup

### Install dependencies

```sh
tinyhttp new elastic
```

### Set up Elasticsearch

There are multiple ways to set up a elasticsearch. The simplest way is docker. If you have docker installed, run the following command `docker run -p 9200:9200 -p 9300:9300 -e ELASTIC_PASSWORD=elastic -e "discovery.type=single-node" -t docker.elastic.co/elasticsearch/elasticsearch:8.7.1`

This will set up a docker container running on host port 9200 and 9300, single node, with password 'elastic'.

## Run

```sh
node index.js
```

## Endpoints

- `GET /search/:index?query=field_to_search&value=value_to_search` - Search index **index** for field **field_to_search** which contains value **value_to_search**

- `POST /insert/:index` - Insert a single document in index **index**

Request Body

```json
{
    "title": string,
    "link": string,
    "abstract": string
}
```

- `POST /insert/bulk/:index` - Insert multiple documents in index **index**

Request Body

```json
{
    "data": [
        {
            "title": string,
            "link": string,
            "abstract": string
        }
    ]
}
```
