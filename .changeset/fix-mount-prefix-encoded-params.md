---
"@tinyhttp/app": patch
---

fix: strip the raw mount path from `req.url` when its params are percent-encoded

The prefix stripped from `req.url` for a middleware or sub-app mounted on a path
with params was rebuilt from the decoded params, but sliced off the raw url.
When a param was percent-encoded the decoded prefix was shorter, so the mounted
middleware or sub-app received a wrong `req.url` and `req.baseUrl`. A sub-app
mounted on `/:tenant` received `/admin/users` for a request to
`/%C3%A9admin/users` instead of `/users`. The prefix is now the part of the raw
url the mount path matched.
