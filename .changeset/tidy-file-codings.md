---
"@tinyhttp/send": patch
---

Do not set a Content-Encoding header for unchanged file bytes in sendFile. Preserve explicit content codings for pre-encoded files.
