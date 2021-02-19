# @tinyhttp/cli

The [tinyhttp](https://github.com/talentlessguy/tinyhttp) CLI.

## Install

```sh
pnpm i -g @tinyhttp/cli
```

## Usage

### `tinyhttp new <template> [folder]`

```sh
tinyhttp new basic my-app
```

#### Arguments

- `template` is the name of template from [examples](https://github.com/talentlessguy/tinyhttp/tree/master/examples) folder.
- `folder` argument is optional

#### Flags

- `--pkg` - custom package manager to use for running installation commands.

Some flags help you to quickly create popular tool configurations for Node.js projects so you don't have to write them from scratch.

- `--prettier` - creates a Prettier config (and installs Prettier)
- `--eslint` - creates an ESLint config (and installs ESLint, Prettier and plugins)
- `--eslint-ts` - creates an ESLint config for a TypeScript project (and installs ESLint, Prettier, TypeScript and plugins)
- `--full` - `--prettier` and `--eslint` combined

### Example

```sh
tinyhttp new basic my-app --full
```
