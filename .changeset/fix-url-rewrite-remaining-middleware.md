---
"@tinyhttp/app": patch
---

fix: run the remaining middleware after a middleware rewrites `req.url`

When a middleware rewrote `req.url` and called `next()`, the request was
forwarded to the routes matching the new url, but the middleware that was
queued for the original url and had not run yet was dropped. A middleware
registered after the one rewriting the url, such as an authentication check,
never ran for that request.

The queued middleware that has not run is now matched against the new url
again, so it still runs when it matches it. The url forwarding behaviour is
otherwise unchanged.
