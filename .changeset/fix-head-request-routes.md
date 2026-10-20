---
"@tinyhttp/app": patch
---

fix: only match GET routes for HEAD requests

A HEAD request matched the routes of every method, so it ran a `POST`, `PUT` or
`DELETE` handler registered on the requested path when no `GET` handler came
before it. A HEAD request now matches the `GET`, `HEAD` and `all` routes only,
the same way as express.
