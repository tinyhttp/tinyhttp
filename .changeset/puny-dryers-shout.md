---
"@tinyhttp/content-disposition": patch
"@tinyhttp/type-is": patch
---

Fix unknown MIME extensions throwing during type matching, and honor explicit false or empty string content disposition fallbacks. A fallback that is not a string or boolean now throws, as in `content-disposition`.
