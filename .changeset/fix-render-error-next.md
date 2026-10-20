---
"@tinyhttp/app": patch
---

fix: pass `res.render` errors to the error handler

`res.render` threw the error a template engine reported. When the engine called
back asynchronously, which is common for engines that read the template file,
the error was thrown outside of any handler and surfaced as an uncaught
exception. The error is now passed to `next()`, so it reaches the app's error
handler like any other error, the same way as express.
