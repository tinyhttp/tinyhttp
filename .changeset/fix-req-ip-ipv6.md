---
"@tinyhttp/app": patch
---

fix: keep IPv6 addresses whole in `req.ip`

`req.ip` stripped everything up to the last colon of the address, meant to
remove the `::ffff:` prefix of IPv4-mapped addresses. That also cut IPv6
addresses down to their last group: `2001:db8:85a3::8a2e:370:7334` became
`7334` and `::1` became `1`, so unrelated IPv6 clients could share the same
`req.ip`. Only the prefix of IPv4-mapped addresses is stripped now.
