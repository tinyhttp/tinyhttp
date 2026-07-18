---
"@tinyhttp/res": patch
"@tinyhttp/app": patch
---

fix open redirect via a backslash in the authority of `res.redirect()` / `res.location()` (GHSA-8q4p-mhxr-fq83). A URL such as `https://evil.com\@trusted.com` was written to the `Location` header with the backslash raw; some URL parsers resolve that to the host `evil.com`, bypassing redirect allowlists. The backslash is now encoded to `%5C`, matching Express, while the real host is still left verbatim.
