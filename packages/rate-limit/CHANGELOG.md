# @tinyhttp/rate-limit

## 2.1.12

### Patch Changes

- c78acaa: fix: fall back to the socket address for the default key
  
  The default `keyGenerator` keyed the requests by `req.ip`, which tinyhttp only
  sets when the `networkExtensions` setting is enabled. Without it every request
  was counted under the same `undefined` key, so all clients shared one limit.
  The default key falls back to the address of the socket when `req.ip` is not
  set.

## 2.1.11

### Patch Changes

- Updated dependencies [bd43b78]
  - @tinyhttp/send@2.2.8

## 2.1.10

### Patch Changes

- Updated dependencies [7f6bdf7]
  - @tinyhttp/send@2.2.7

## 2.1.9

### Patch Changes

- Updated dependencies [d28bdb8]
- Updated dependencies [65fa2f7]
  - @tinyhttp/send@2.2.6

## 2.1.8

### Patch Changes

- Updated dependencies [ccd1129]
  - @tinyhttp/send@2.2.5

## 2.1.7

### Patch Changes

- 7576d70: Remove dead code

## 2.1.6

### Patch Changes

- Updated dependencies [c9710e3]
  - @tinyhttp/send@2.2.4

## 2.1.5

### Patch Changes

- 2645916: stop using non-null assertion in source
