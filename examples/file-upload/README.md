# File upload example

Simple tinyhttp + [formidable](https://github.com/node-formidable/formidable) example.

## Install

```sh
pnpm i
```

## Run

```
node index.js
```

Then send a file (using `curl` or any other HTTP client):

```sh
curl -F "file=@index.js" localhost:3000/api/upload
```

Output should be something like this:

```json
{
  "fields": {},
  "files": {
    "file": {
      "size": 705,
      "path": "/tmp/upload_09830274c55da0f3ffdc1d45ebe2bbe9",
      "name": "index.js",
      "type": "application/octet-stream",
      "mtime": "2020-09-08T19:36:52.735Z"
    }
  }
}
```
