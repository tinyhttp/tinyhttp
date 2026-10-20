---
"@tinyhttp/app": patch
---

fix: derive `req.protocol` and `req.secure` from the TLS socket

`getProtocol` read `req.secure` to tell whether the connection is encrypted, but
`req.secure` is only set from the result of `getProtocol`, so it was never set
at that point. A request to an HTTPS server got `req.protocol` `http` and
`req.secure` `false` unless a trusted proxy sent `X-Forwarded-Proto`. The
protocol is now derived from the socket being encrypted, the same way as
express.
