---
"@tinyhttp/req": patch
"@tinyhttp/send": patch
---

Bump `header-range-parser` from 1.1.4 to 2.0.0.

- Fixes broken TypeScript declarations shipped with v1.x ([r37r0m0d3l/header-range-parser#429](https://github.com/r37r0m0d3l/header-range-parser/issues/429))
- Malformed `Range` headers (e.g. `bytes=abc-def`) are now classified as syntactically invalid per RFC 9110 and ignored, so `sendFile` serves a 200 full-body response instead of 416. Unsatisfiable and inverted ranges (e.g. `bytes=10-5`) still respond with 416.
- `req.range()` now returns `-2` (invalid) instead of `-1` (unsatisfiable) for such headers.
- header-range-parser v2 is ESM-only and declares `engines.node: >=20.19.0`. The shipped code is ES2015-compatible and keeps working on older Node versions via `import`, but package managers may emit engine warnings on Node < 20.19.
