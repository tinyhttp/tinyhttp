# @tinyhttp/send

## 2.2.8

### Patch Changes

- bd43b78: Bump `header-range-parser` from 1.1.4 to 2.0.0.

  - Fixes broken TypeScript declarations shipped with v1.x ([r37r0m0d3l/header-range-parser#429](https://github.com/r37r0m0d3l/header-range-parser/issues/429))
  - Malformed `Range` headers (e.g. `bytes=abc-def`) are now classified as syntactically invalid per RFC 9110 and ignored, so `sendFile` serves a 200 full-body response instead of 416. Unsatisfiable and inverted ranges (e.g. `bytes=10-5`) still respond with 416.
  - `req.range()` now returns `-2` (invalid) instead of `-1` (unsatisfiable) for such headers.
  - header-range-parser v2 is ESM-only and declares `engines.node: >=20.19.0`. The shipped code is ES2015-compatible and keeps working on older Node versions via `import`, but package managers may emit engine warnings on Node < 20.19.

## 2.2.7

### Patch Changes

- 7f6bdf7: fix DoS via malformed `Range` header in `res.sendFile()` (GHSA-w65r-fqv6-q6w9). Range parsing now uses `header-range-parser`, so an inverted or malformed range (e.g. `bytes=10-5`) returns `416` instead of producing a negative `Content-Length` and crashing the process. The default error handler also no longer attempts to write headers after they have been sent.

## 2.2.6

### Patch Changes

- d28bdb8: replace mime with mrmime
- 65fa2f7: fix path Traversal in `res.sendFile()` and `res.download()` when `root` option is not specified

## 2.2.5

### Patch Changes

- ccd1129: Fix root traversal in sendFile

## 2.2.4

### Patch Changes

- c9710e3: 2025
