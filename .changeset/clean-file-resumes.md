---
"@tinyhttp/send": patch
---

Honor If-Range when sending a file. Return the full body unless the validator matches a strong ETag.
