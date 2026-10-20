---
"@tinyhttp/rate-limit": patch
---

fix: fall back to the socket address for the default key

The default `keyGenerator` keyed the requests by `req.ip`, which tinyhttp only
sets when the `networkExtensions` setting is enabled. Without it every request
was counted under the same `undefined` key, so all clients shared one limit.
The default key falls back to the address of the socket when `req.ip` is not
set.
