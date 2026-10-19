---
"@tinyhttp/app": patch
---

fix: match the remaining middleware and routes against the original url (GHSA-6xff-v2p2-cwwc)

A middleware registered on a path is given the url relative to that path, e.g.
`app.use('/public', fn)` receives `/dashboard` for a request to
`/public/dashboard`. That url was never restored when the middleware handed the
request back with `next()`, so the dispatch loop kept resolving the rest of the
chain against the stripped url. A request to `/public/dashboard` was therefore
matched against `/dashboard` instead of `/public/dashboard`, which skipped the
middleware registered after the mounted one.

- the original url is restored when a mounted middleware calls `next()` without
  rewriting the url itself, so the remaining middleware and routes are matched
  against it
- a middleware that rewrites `req.url` still forwards the request to the route
  matching the rewritten url
- routes registered under a mount path are reachable again
