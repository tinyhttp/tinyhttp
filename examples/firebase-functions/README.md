# Firebase function example

Basic example using tinyhttp, typescript with firebase function.

Feel free to modify `.firebaserc` and `firebase.json` to fit your needs.

## Install and login with firebase cli tool

```sh
pnpm install -g firebase-tools

firebase login
```

## Install dependencies / Setup

```sh
pnpm install
```

## Build & Run with local emulators

```
pnpm run serve
```

## Deploy

You may need to active the bill before you deploy it.
ref:https://stackoverflow.com/questions/62824043/is-function-cloud-in-firebase-free-or-not-cloud-functions-deployment-requires-t

```
pnpm run deploy
```
