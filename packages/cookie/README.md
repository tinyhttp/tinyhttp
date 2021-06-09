# @tinyhttp/cookie

[![npm (scoped)](https://img.shields.io/npm/v/@tinyhttp/cookie?style=flat-square)](https://npmjs.com/package/@tinyhttp/cookie) [![npm](https://img.shields.io/npm/dt/@tinyhttp/cookie?style=flat-square)](https://npmjs.com/package/@tinyhttp/cookie)

> A rewrite of [cookie](https://github.com/jshttp/cookie) module.

HTTP cookie parser and serializer for Node.js.

## Install

```sh
pnpm i @tinyhttp/cookie
```

## API

```js
import { parse, serialize } from '@tinyhttp/cookie'
```

### `parse(str, options)`

Parse an HTTP `Cookie` header string and returning an object of all cookie name-value pairs.
The `str` argument is the string representing a `Cookie` header value and `options` is an
optional object containing additional parsing options.

```js
import { parse } from '@tinyhttp/cookie'

parse('foo=bar; equation=E%3Dmc%5E2')
// { foo: 'bar', equation: 'E=mc^2' }
```

#### Options

`parse` accepts these properties in the options object.

##### `decode`

Specifies a function that will be used to decode a cookie's value. Since the value of a cookie
has a limited character set (and must be a simple string), this function can be used to decode
a previously-encoded cookie value into a JavaScript string or other object.

The default function is the global `decodeURIComponent`, which will decode any URL-encoded
sequences into their byte representations.

**note** if an error is thrown from this function, the original, non-decoded cookie value will
be returned as the cookie's value.

### `serialize(name, value, options)`

Serialize a cookie name-value pair into a `Set-Cookie` header string. The `name` argument is the
name for the cookie, the `value` argument is the value to set the cookie to, and the `options`
argument is an optional object containing additional serialization options.

```js
import { serialize } from '@tinyhttp/cookie'

serialize('foo', 'bar')
// foo=bar
```

#### Options

`serialize` accepts these properties in the options object.

##### `domain`

Specifies the value for the [`Domain` `Set-Cookie` attribute][rfc-6265-5.2.3]. By default, no
domain is set, and most clients will consider the cookie to apply to only the current domain.

##### `encode`

Specifies a function that will be used to encode a cookie's value. Since value of a cookie
has a limited character set (and must be a simple string), this function can be used to encode
a value into a string suited for a cookie's value.

The default function is the global `encodeURIComponent`, which will encode a JavaScript string
into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

##### `expires`

Specifies the `Date` object to be the value for the [`Expires` `Set-Cookie` attribute][rfc-6265-5.2.1].
By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and
will delete it on a condition like exiting a web browser application.

**note** the [cookie storage model specification][rfc-6265-5.3] states that if both `expires` and
`maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
so if both are set, they should point to the same date and time.

##### `httpOnly`

Specifies the `boolean` value for the [`HttpOnly` `Set-Cookie` attribute][rfc-6265-5.2.6]. When truthy,
the `HttpOnly` attribute is set, otherwise it is not. By default, the `HttpOnly` attribute is not set.

**note** be careful when setting this to `true`, as compliant clients will not allow client-side
JavaScript to see the cookie in `document.cookie`.

##### `maxAge`

Specifies the `number` (in seconds) to be the value for the [`Max-Age` `Set-Cookie` attribute][rfc-6265-5.2.2].
The given number will be converted to an integer by rounding down. By default, no maximum age is set.

**note** the [cookie storage model specification][rfc-6265-5.3] states that if both `expires` and
`maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
so if both are set, they should point to the same date and time.

##### `path`

Specifies the value for the [`Path` `Set-Cookie` attribute][rfc-6265-5.2.4]. By default, the path
is considered the ["default path"][rfc-6265-5.1.4].

##### `sameSite`

Specifies the `boolean` or `string` to be the value for the [`SameSite` `Set-Cookie` attribute][rfc-6265bis-03-4.1.2.7].

- `true` will set the `SameSite` attribute to `Strict` for strict same site enforcement.
- `false` will not set the `SameSite` attribute.
- `'lax'` will set the `SameSite` attribute to `Lax` for lax same site enforcement.
- `'none'` will set the `SameSite` attribute to `None` for an explicit cross-site cookie.
- `'strict'` will set the `SameSite` attribute to `Strict` for strict same site enforcement.

More information about the different enforcement levels can be found in
[the specification][rfc-6265bis-03-4.1.2.7].

**note** This is an attribute that has not yet been fully standardized, and may change in the future.
This also means many clients may ignore this attribute until they understand it.

##### `secure`

Specifies the `boolean` value for the [`Secure` `Set-Cookie` attribute][rfc-6265-5.2.5]. When truthy,
the `Secure` attribute is set, otherwise it is not. By default, the `Secure` attribute is not set.

**note** be careful when setting this to `true`, as compliant clients will not send the cookie back to
the server in the future if the browser does not have an HTTPS connection.

## Example

```ts
import { App } from '@tinyhttp/app'
import { parse, serialize } from '@tinyhttp/cookie'
import { escapeHTML } from 'es-escape-html'

new App()
  .use((req, res) => {
    if (req.query?.name) {
      // Set a new cookie with the name
      res.set(
        'Set-Cookie',
        serialize('name', String(query.name), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7 // 1 week
        })
      )

      // Redirect back after setting cookie
      res
        .status(302)
        .set('Location', req.headers.referer || '/')
        .end()
    }

    const cookie = parse(req.headers.cookie || '')

    const { name } = cookie

    res.set('Content-Type', 'text/html; charset=UTF-8')

    res.write(name ? `<p>Welcome back, <strong>${escapeHTML(name)}</strong>!</p>` : '<p>Hello, new visitor!</p>')

    res.write('<form method="GET">')
    res.write('<input placeholder="enter your name" name="name"><input type="submit" value="Set Name">')
    res.end('</form>')
  })
  .listen(3000)
```
