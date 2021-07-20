# WebSocket server example

A simple WebSocket + HTTP server example with tinyhttp and [tinyws](https://github.com/talentlessguy/tinyws).

## Install

```sh
tinyhttp new ws
```

## Run

```sh
node index.js
```

now open a few terminal windows and send messages:

```sh
$ wscat -c http://localhost:3000/chat
# > hello
# < hello
# < someone else sent this
# >
```
