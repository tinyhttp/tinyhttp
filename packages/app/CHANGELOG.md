# @tinyhttp/app

## 3.0.10

### Patch Changes

- bf0e89b: fix: add TypeScript overload signatures for accepts methods
- Updated dependencies [bd43b78]
  - @tinyhttp/req@2.2.10
  - @tinyhttp/res@2.2.14

## 3.0.9

### Patch Changes

- 4869a41: fix open redirect via a backslash in the authority of `res.redirect()` / `res.location()` (GHSA-8q4p-mhxr-fq83). A URL such as `https://evil.com\@trusted.com` was written to the `Location` header with the backslash raw; some URL parsers resolve that to the host `evil.com`, bypassing redirect allowlists. The backslash is now encoded to `%5C`, matching Express, while the real host is still left verbatim.
- 7f6bdf7: fix DoS via malformed `Range` header in `res.sendFile()` (GHSA-w65r-fqv6-q6w9). Range parsing now uses `header-range-parser`, so an inverted or malformed range (e.g. `bytes=10-5`) returns `416` instead of producing a negative `Content-Length` and crashing the process. The default error handler also no longer attempts to write headers after they have been sent.
- Updated dependencies [4869a41]
  - @tinyhttp/res@2.2.13

## 3.0.8

### Patch Changes

- Updated dependencies [d28bdb8]
  - @tinyhttp/accepts@2.3.1
  - @tinyhttp/res@2.2.12
  - @tinyhttp/req@2.2.9

## 3.0.7

### Patch Changes

- Updated dependencies [29a4c87]
  - @tinyhttp/res@2.2.11

## 3.0.6

### Patch Changes

- 962c6ab: Improve performance of the router and app
- 8b4743c: Fix invalid (duplicate and uneeded) dependencies
- Updated dependencies [962c6ab]
- Updated dependencies [8b4743c]
  - @tinyhttp/router@2.2.5
  - @tinyhttp/req@2.2.8
  - @tinyhttp/res@2.2.10

## 3.0.5

### Patch Changes

- 7221030: Improve performance by caching instances and avoiding reaction on function calls (no breaking changes)
- Updated dependencies [7221030]
  - @tinyhttp/router@2.2.4

## 3.0.4

### Patch Changes

- 7576d70: Remove dead code
- Updated dependencies [f891136]
- Updated dependencies [7576d70]
  - @tinyhttp/proxy-addr@3.0.1
  - @tinyhttp/res@2.2.9

## 3.0.3

### Patch Changes

- @tinyhttp/req@2.2.7
- @tinyhttp/res@2.2.8

## 3.0.2

### Patch Changes

- @tinyhttp/res@2.2.7

## 3.0.1

### Patch Changes

- b6090ce: make sure OIDC is actually triggered

## 3.0.0

### Major Changes

- c9710e3: 2025

### Patch Changes

- Updated dependencies [c9710e3]
  - @tinyhttp/proxy-addr@3.0.0
  - @tinyhttp/res@2.2.6
  - @tinyhttp/req@2.2.6

## 2.5.2

### Patch Changes

- d3ae434: fix(app): `res.sendFile` type signature

## 2.5.1

### Patch Changes

- 9147364: fix req.is
- 2645916: stop using non-null assertion in source
- Updated dependencies [2645916]
  - @tinyhttp/req@2.2.5
  - @tinyhttp/res@2.2.5
  - @tinyhttp/proxy-addr@2.2.1
