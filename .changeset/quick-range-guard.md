---
"@tinyhttp/send": patch
"@tinyhttp/app": patch
---

fix DoS via malformed `Range` header in `res.sendFile()` (GHSA-w65r-fqv6-q6w9). An inverted or malformed range (e.g. `bytes=10-5`) now returns `416` instead of crashing the process. The default error handler also no longer attempts to write headers after they have been sent.
