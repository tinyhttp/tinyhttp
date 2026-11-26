---
"@tinyhttp/res": minor
---

Build the `Content-Disposition` header with [`content-disposition@3`](https://github.com/jshttp/content-disposition) instead of `@tinyhttp/content-disposition`, which is deprecated.

`res.attachment` and `res.download` now send plain filenames without quotes (`attachment; filename=favicon.ico`), and add an ASCII fallback plus `filename*` for non-ASCII names. `res.download(path, name)` also strips the directory from `name`, so a custom filename containing a path no longer leaks it to the client.
