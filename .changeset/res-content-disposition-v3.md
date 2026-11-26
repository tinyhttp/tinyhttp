---
"@tinyhttp/res": minor
---

Use `create` from `@tinyhttp/content-disposition` v3 and strip the directory from custom `download` filenames.

`res.attachment` and `res.download` now send plain filenames without quotes (`attachment; filename=favicon.ico`) and add an ASCII fallback plus `filename*` for non-ASCII names. `res.download(path, name)` also applies `path.basename` to `name`, so a custom filename containing a directory no longer leaks the path to the client.
