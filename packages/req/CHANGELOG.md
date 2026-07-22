# @tinyhttp/req

## 2.2.10

### Patch Changes

- bd43b78: Bump `header-range-parser` from 1.1.4 to 2.0.0.

  - Fixes broken TypeScript declarations shipped with v1.x ([r37r0m0d3l/header-range-parser#429](https://github.com/r37r0m0d3l/header-range-parser/issues/429))
  - Malformed `Range` headers (e.g. `bytes=abc-def`) are now classified as syntactically invalid per RFC 9110 and ignored, so `sendFile` serves a 200 full-body response instead of 416. Unsatisfiable and inverted ranges (e.g. `bytes=10-5`) still respond with 416.
  - `req.range()` now returns `-2` (invalid) instead of `-1` (unsatisfiable) for such headers.
  - header-range-parser v2 is ESM-only and declares `engines.node: >=20.19.0`. The shipped code is ES2015-compatible and keeps working on older Node versions via `import`, but package managers may emit engine warnings on Node < 20.19.

## 2.2.9

### Patch Changes

- Updated dependencies [d28bdb8]
  - @tinyhttp/accepts@2.3.1
  - @tinyhttp/type-is@2.2.6

## 2.2.8

### Patch Changes

- 8b4743c: Fix invalid (duplicate and uneeded) dependencies

## 2.2.7

### Patch Changes

- Updated dependencies [8c981e0]
  - @tinyhttp/accepts@2.3.0

## 2.2.6

### Patch Changes

- Updated dependencies [c9710e3]
  - @tinyhttp/accepts@2.2.4
  - @tinyhttp/type-is@2.2.5

## 2.2.5

### Patch Changes

- 2645916: stop using non-null assertion in source
