---
"@tinyhttp/app": patch
"@tinyhttp/res": patch
---

fix: sanitize default error handler output (GHSA-rqg5-h5qr-gp89)

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
