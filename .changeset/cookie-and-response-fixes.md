---
"@tinyhttp/cookie": patch
"@tinyhttp/res": patch
"@tinyhttp/send": patch
---

fix: validate cookie grammar and stop emitting `undefined` content types

`cookie.serialize` used the RFC 7230 field-content grammar, which accepts any
printable ASCII character. A name such as `a b` was serialized as `a b=c`, and a
value such as `bar;baz` was serialized as `bar;baz`, adding an attribute to the
`Set-Cookie` header that the caller never asked for. Names and values are now
validated against the `cookie-name` and `cookie-value` grammars from RFC 6265
sec 4.1.1.

`res.type()`, `res.attachment()` and `res.sendFile()` passed the result of the
extension lookup straight to the header. When the mime table has no entry for
the extension (`.ico` among them) the header became
`Content-Type: undefined; charset=utf-8`. The lookup now falls back to
`application/octet-stream`.

`res.send()` with no body called `toString()` on `undefined` and threw a
`TypeError`, which surfaced as a 500 response. It now ends the response with an
empty body, the same way `res.send(null)` already did.
