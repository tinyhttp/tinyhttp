---
"@tinyhttp/send": patch
"@tinyhttp/app": patch
---

fix DoS via malformed `Range` header in `res.sendFile()` (GHSA-w65r-fqv6-q6w9). Range parsing now uses `header-range-parser`, so an inverted or malformed range (e.g. `bytes=10-5`) returns `416` instead of producing a negative `Content-Length` and crashing the process. The default error handler also no longer attempts to write headers after they have been sent.
