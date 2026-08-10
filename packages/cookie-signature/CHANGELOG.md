# @tinyhttp/cookie-signature

## 2.1.2

### Patch Changes

- e46a5cc: fix: compare the full signature in `unsign` (GHSA-63x4-8g8c-vhww)

  `unsign` copied the untrusted value into a buffer sized to the expected MAC,
  which truncated anything longer before the comparison. A valid cookie with
  arbitrary data appended (`` `${sign('mysessionid', 'secret')}tampered` ``)
  therefore verified successfully and returned `mysessionid` instead of `false`.

  `unsign` now compares the signature alone rather than the whole cookie. The
  payload is sliced out of the value being checked, so comparing the full strings
  only ever compared it against itself; the signature is the untrusted part. The
  expected signature is always 43 bytes, and one of any other length is rejected
  outright instead of being truncated to fit.

  Values produced by `sign` verify exactly as before; only values that were never
  validly signed change from accepted to rejected.
