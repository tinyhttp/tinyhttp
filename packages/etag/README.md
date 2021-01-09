# @tinyhttp/etag

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/etag?style=flat-square)](https://npmjs.com/package/@tinyhttp/etag) [![npm](https://img.shields.io/npm/dt/@tinyhttp/etag?style=flat-square)](https://npmjs.com/package/@tinyhttp/etag) [![](https://img.shields.io/badge/website-visit-hotpink?style=flat-square)](https://tinyhttp.v1rtl.site/mw/etag)

> A rewrite of [etag](https://www.npmjs.com/package/etag) module.

This module generates HTTP ETags (as defined in RFC 7232) for use in HTTP responses.

## Install

```sh
pnpm i @tinyhttp/etag
```

## API

```ts
import { eTag } from '@tinyhttp/etag'
```

`eTag(entity, [options])`

Generate a strong ETag for the given entity. This should be the complete body of the entity. Strings, `Buffer`s, and `fs.Stats` are accepted. By default, a strong ETag is generated except for `fs.Stats`, which will generate a weak ETag (this can be overwritten by options.weak).

```ts
res.setHeader('ETag', eTag(body))
```

### Options

`eTag` accepts these properties in the options object.

#### `weak`

Specifies if the generated ETag will include the weak validator mark (that is, the leading `W/`). The actual entity tag is the same. The default value is `false`, unless the entity is `fs.Stats`, in which case it is `true`.
