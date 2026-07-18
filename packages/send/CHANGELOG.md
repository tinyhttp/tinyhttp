# @tinyhttp/send

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
