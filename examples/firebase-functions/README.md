# Firebase function example

Basic example using tinyhttp, typescript with firebase function.

Feel free to modify `.firebaserc` and `firebase.json` to fit your needs.

## Setup

```sh
pnpm i
pnpx firebase login
tinyhttp new firebase-functions
```

## Build & Run with local emulators

```sh
pnpm run serve
```

## Deploy

You may need to active the bill before you deploy it ([more info](https://stackoverflow.com/questions/62824043/is-function-cloud-in-firebase-free-or-not-cloud-functions-deployment-requires-t)).

```sh
pnpm run deploy
```
