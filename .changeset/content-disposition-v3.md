---
"@tinyhttp/content-disposition": major
---

Port `content-disposition@3.1.0`.

**Breaking changes**

- The default export is now the named `create` export. The `contentDisposition` name is still exported as a deprecated alias, and `parse`, `format`, `encodeExtended` and `decodeExtended` are new exports.
- `ContentDisposition` is now an interface, not a class. `parse` returns a plain object whose `parameters` has a null prototype, so `new ContentDisposition(...)` no longer works.
- `create` no longer strips the directory from the filename. Pass a bare file name (e.g. `path.basename`), or the path is sent to the client.
- Plain `filename` values are US-ASCII only. Non-ASCII names are always sent as `filename*` plus a `?` fallback, unless `fallback: false` is set. A string `fallback` must be US-ASCII or a `TypeError` is thrown.
- Plain filenames are written without quotes when they are valid tokens (e.g. `attachment; filename=plans.pdf` instead of `attachment; filename="plans.pdf"`). Both forms are valid RFC 6266.
- `parse` is lenient: it accepts raw Unicode and does not validate the language tag of extended parameters. It no longer throws `invalid extended field value` for `filename*=UTF-8'en-US'...` or `filename*=UTF-8''`; it has new `multipart` and `extended` options.
- `fallback` values that are neither a string nor a boolean (such as `null` or `0`) are treated as the default instead of throwing.
- The package now requires Node.js 14.0.0 or newer.
