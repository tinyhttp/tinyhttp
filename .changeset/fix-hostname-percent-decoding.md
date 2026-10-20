---
"@tinyhttp/app": patch
---

fix: do not percent-decode the host

The `Host`, `:authority` and `X-Forwarded-Host` headers were passed through
`decodeURIComponent` before deriving `req.hostname`, `req.port` and
`req.subdomains`. A host is not percent-encoded, so `Host: a%2Eb.com` gave
`req.hostname` `a.b.com`, a host the request was not sent to, and a malformed
escape such as `Host: %` failed the request with a 500. The host is now only
lowercased, the same way as express.
