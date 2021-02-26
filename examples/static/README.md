# Static server example

Simple example with using tinyhttp and [sirv](https://github.com/lukeed/sirv/)

## Install

```sh
tinyhttp new static
```

## Run

Start a server:

```sh
node index.js
```

then try to request the file with `curl`:

```sh
curl files/hello.txt
# Hello World
```
