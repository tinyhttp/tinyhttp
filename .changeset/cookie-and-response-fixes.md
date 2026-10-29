---
"@tinyhttp/cookie": patch
"@tinyhttp/res": patch
"@tinyhttp/send": patch
---

fix: validate cookie grammar and stop emitting `undefined` content types

`cookie.serialize` validated names and values with the RFC 7230 field-content
grammar, which accepts almost any printable character. A name containing
whitespace or one of `"(),/:;<=>?@[\]{}` was serialized as-is, and a value that
a custom `encode` left raw could carry `;`, adding an attribute to `Set-Cookie`
that the caller did not ask for. Names are now checked against the RFC 6265
`cookie-name` grammar and values against `cookie-value`, so such input throws
`argument name is invalid` / `argument val is invalid` instead of producing a
malformed header. Values encoded by the default `encodeURIComponent` are
unaffected, because its output is always a valid `cookie-value`.

`res.type()`, `res.attachment()` and `res.sendFile()` passed the result of the
mime lookup straight to the header. When the extension is unknown or absent
(`.ico` is not in the mime table, and neither is an extensionless file) the
header became `Content-Type: undefined; charset=utf-8`. The lookup now falls
back to `application/octet-stream`.

`res.send()` with no body called `toString()` on `undefined` and threw a
`TypeError`, which surfaced as a 500 response. It now ends the response with an
empty body and no `Content-Type`, the same response as `res.send(null)`.
