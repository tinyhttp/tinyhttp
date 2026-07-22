# @tinyhttp/res

## 2.2.14

### Patch Changes

- Updated dependencies [bd43b78]
  - @tinyhttp/req@2.2.10
  - @tinyhttp/send@2.2.8

## 2.2.13

### Patch Changes

- 4869a41: fix open redirect via a backslash in the authority of `res.redirect()` / `res.location()` (GHSA-8q4p-mhxr-fq83). A URL such as `https://evil.com\@trusted.com` was written to the `Location` header with the backslash raw; some URL parsers resolve that to the host `evil.com`, bypassing redirect allowlists. The backslash is now encoded to `%5C`, matching Express, while the real host is still left verbatim.
- Updated dependencies [7f6bdf7]
  - @tinyhttp/send@2.2.7

## 2.2.12

### Patch Changes

- d28bdb8: replace mime with mrmime
- Updated dependencies [d28bdb8]
- Updated dependencies [65fa2f7]
  - @tinyhttp/send@2.2.6
  - @tinyhttp/req@2.2.9

## 2.2.11

### Patch Changes

- 29a4c87: harden redirect location handling
- Updated dependencies [ccd1129]
  - @tinyhttp/send@2.2.5

## 2.2.10

### Patch Changes

- 8b4743c: Fix invalid (duplicate and uneeded) dependencies
- Updated dependencies [8b4743c]
  - @tinyhttp/req@2.2.8

## 2.2.9

### Patch Changes

- 7576d70: Remove dead code
- Updated dependencies [7576d70]
  - @tinyhttp/content-disposition@2.2.4

## 2.2.8

### Patch Changes

- @tinyhttp/req@2.2.7

## 2.2.7

### Patch Changes

- Updated dependencies
  - @tinyhttp/content-disposition@2.2.3

## 2.2.6

### Patch Changes

- c9710e3: 2025
- Updated dependencies [c9710e3]
  - @tinyhttp/send@2.2.4
  - @tinyhttp/req@2.2.6

## 2.2.5

### Patch Changes

- 2645916: stop using non-null assertion in source
- Updated dependencies [2645916]
  - @tinyhttp/req@2.2.5
