# Contributing

Contributions are always welcome, here's an instruction of how to contribute.

## Local setup

### Install

- Clone the repo first:

```sh
# git
git clone https://github.com/talentlessguy/tinyhttp.git

# (or) hub
hub clone talentlessguy/tinyhttp
```

- Install Node.js (v14 is recommended) and `pnpm`:

```sh
# Install fnm
curl -fsSL https://github.com/Schniz/fnm/raw/master/.ci/install.sh | bash

# Install latest Node.js version
fnm install latest
fnm use latest
```

- Install the dependencies at root and in the packages:

```sh
pnpm install && pnpm recursive install
```

- Build fresh packages

```sh
pnpm build -r
```

### Format

If you use VS Code, please install Prettier and ESLint plugins for proper linting and code formatting.
If you don't use VS Code or any other editor that has support of those, run `pnpm lint` before committing (todo: add pre-commit hook).

## Sending PRs

Here's a small list of requirements for your PR:

- it should be linted and formatted properly using configurations in the root
- it should build without errors and warnings
- it should have been tested (todo: setup coverage tool and write a test for one of the packages as an example)
- PR must have a clear description of what it does, which part of the repo it affects
- if PR is adding a new middleware, it should have an example in the description.
- PR must have an appropriate label

If everything from the list is done right, feel free to submit a PR! I will look into it asap.

If some further assistance before making a PR is needed, ping me on [telegram](https://t.me/talentless_guy) or [twitter](https://twitter.com/v1rtl).
