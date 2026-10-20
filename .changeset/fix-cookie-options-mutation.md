---
"@tinyhttp/res": patch
---

fix: do not modify the options passed to `res.cookie`

`res.cookie` converted `maxAge` from milliseconds to seconds and set `expires`
and `path` on the options object it was given. When the same object was reused,
which is common for a shared cookie config, `maxAge` was divided by 1000 again
on every call and the cookies expired sooner and sooner. The options are now
copied before they are adjusted.
