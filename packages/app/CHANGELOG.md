# @tinyhttp/app

## 3.0.13

### Patch Changes

- 4f494ae: fix: only match GET routes for HEAD requests
  
  A HEAD request matched the routes of every method, so it ran a `POST`, `PUT` or
  `DELETE` handler registered on the requested path when no `GET` handler came
  before it. A HEAD request now matches the `GET`, `HEAD` and `all` routes only,
  the same way as express.
- 43d086f: fix: do not percent-decode the host
  
  The `Host`, `:authority` and `X-Forwarded-Host` headers were passed through
  `decodeURIComponent` before deriving `req.hostname`, `req.port` and
  `req.subdomains`. A host is not percent-encoded, so `Host: a%2Eb.com` gave
  `req.hostname` `a.b.com`, a host the request was not sent to, and a malformed
  escape such as `Host: %` failed the request with a 500. The host is now only
  lowercased, the same way as express.
- 89dbb01: fix: strip the raw mount path from `req.url` when its params are percent-encoded
  
  The prefix stripped from `req.url` for a middleware or sub-app mounted on a path
  with params was rebuilt from the decoded params, but sliced off the raw url.
  When a param was percent-encoded the decoded prefix was shorter, so the mounted
  middleware or sub-app received a wrong `req.url` and `req.baseUrl`. A sub-app
  mounted on `/:tenant` received `/admin/users` for a request to
  `/%C3%A9admin/users` instead of `/users`. The prefix is now the part of the raw
  url the mount path matched.
- f0636c7: fix: keep IPv6 addresses whole in `req.ip`
  
  `req.ip` stripped everything up to the last colon of the address, meant to
  remove the `::ffff:` prefix of IPv4-mapped addresses. That also cut IPv6
  addresses down to their last group: `2001:db8:85a3::8a2e:370:7334` became
  `7334` and `::1` became `1`, so unrelated IPv6 clients could share the same
  `req.ip`. Only the prefix of IPv4-mapped addresses is stripped now.
- aa54fc4: fix: derive `req.protocol` and `req.secure` from the TLS socket
  
  `getProtocol` read `req.secure` to tell whether the connection is encrypted, but
  `req.secure` is only set from the result of `getProtocol`, so it was never set
  at that point. A request to an HTTPS server got `req.protocol` `http` and
  `req.secure` `false` unless a trusted proxy sent `X-Forwarded-Proto`. The
  protocol is now derived from the socket being encrypted, the same way as
  express.
- 00f5f9b: fix: run the remaining middleware after a middleware rewrites `req.url`
  
  When a middleware rewrote `req.url` and called `next()`, the request was
  forwarded to the routes matching the new url, but the middleware that was
  queued for the original url and had not run yet was dropped. A middleware
  registered after the one rewriting the url, such as an authentication check,
  never ran for that request.
  
  The queued middleware that has not run is now matched against the new url
  again, so it still runs when it matches it. The url forwarding behaviour is
  otherwise unchanged.
- Updated dependencies [ae7f7a0]
  - @tinyhttp/res@2.2.16

## 3.0.12

### Patch Changes

- 1f5622f: fix: match the remaining middleware and routes against the original url (GHSA-6xff-v2p2-cwwc)
  
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

## 3.0.11

### Patch Changes

- 0d81969: fix: sanitize default error handler output (GHSA-rqg5-h5qr-gp89)

  The default `onErrorHandler` reflected attacker-influenced error content
  (route params, query strings, cookies, etc.) byte-for-byte into the response
  body with no escaping and no `Content-Type`, which browsers could MIME-sniff
  as HTML and execute (reflected XSS).

  - Escape all reflected error content using the existing `escapeHTML` helper.
  - Always set `Content-Type: text/plain; charset=utf-8` and
    `X-Content-Type-Options: nosniff` on error responses.
  - Suppress raw error details when `NODE_ENV === 'production'`.

  `escapeHTML` is now exported from `@tinyhttp/res` so it can be reused
  framework-wide.

- Updated dependencies [0d81969]
  - @tinyhttp/res@2.2.15

## 3.0.10

### Patch Changes

- bf0e89b: fix: add TypeScript overload signatures for accepts methods
- Updated dependencies [bd43b78]
  - @tinyhttp/req@2.2.10
  - @tinyhttp/res@2.2.14

## 3.0.9

### Patch Changes

- 4869a41: fix open redirect via a backslash in the authority of `res.redirect()` / `res.location()` (GHSA-8q4p-mhxr-fq83). A URL such as `https://evil.com\@trusted.com` was written to the `Location` header with the backslash raw; some URL parsers resolve that to the host `evil.com`, bypassing redirect allowlists. The backslash is now encoded to `%5C`, matching Express, while the real host is still left verbatim.
- 7f6bdf7: fix DoS via malformed `Range` header in `res.sendFile()` (GHSA-w65r-fqv6-q6w9). Range parsing now uses `header-range-parser`, so an inverted or malformed range (e.g. `bytes=10-5`) returns `416` instead of producing a negative `Content-Length` and crashing the process. The default error handler also no longer attempts to write headers after they have been sent.
- Updated dependencies [4869a41]
  - @tinyhttp/res@2.2.13

## 3.0.8

### Patch Changes

- Updated dependencies [d28bdb8]
  - @tinyhttp/accepts@2.3.1
  - @tinyhttp/res@2.2.12
  - @tinyhttp/req@2.2.9

## 3.0.7

### Patch Changes

- Updated dependencies [29a4c87]
  - @tinyhttp/res@2.2.11

## 3.0.6

### Patch Changes

- 962c6ab: Improve performance of the router and app
- 8b4743c: Fix invalid (duplicate and uneeded) dependencies
- Updated dependencies [962c6ab]
- Updated dependencies [8b4743c]
  - @tinyhttp/router@2.2.5
  - @tinyhttp/req@2.2.8
  - @tinyhttp/res@2.2.10

## 3.0.5

### Patch Changes

- 7221030: Improve performance by caching instances and avoiding reaction on function calls (no breaking changes)
- Updated dependencies [7221030]
  - @tinyhttp/router@2.2.4

## 3.0.4

### Patch Changes

- 7576d70: Remove dead code
- Updated dependencies [f891136]
- Updated dependencies [7576d70]
  - @tinyhttp/proxy-addr@3.0.1
  - @tinyhttp/res@2.2.9

## 3.0.3

### Patch Changes

- @tinyhttp/req@2.2.7
- @tinyhttp/res@2.2.8

## 3.0.2

### Patch Changes

- @tinyhttp/res@2.2.7

## 3.0.1

### Patch Changes

- b6090ce: make sure OIDC is actually triggered

## 3.0.0

### Major Changes

- c9710e3: 2025

### Patch Changes

- Updated dependencies [c9710e3]
  - @tinyhttp/proxy-addr@3.0.0
  - @tinyhttp/res@2.2.6
  - @tinyhttp/req@2.2.6

## 2.5.2

### Patch Changes

- d3ae434: fix(app): `res.sendFile` type signature

## 2.5.1

### Patch Changes

- 9147364: fix req.is
- 2645916: stop using non-null assertion in source
- Updated dependencies [2645916]
  - @tinyhttp/req@2.2.5
  - @tinyhttp/res@2.2.5
  - @tinyhttp/proxy-addr@2.2.1
