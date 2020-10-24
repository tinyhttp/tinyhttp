# @tinyhttp/app

## 0.5.5

### Patch Changes

- Fix missing dep
- Updated dependencies [undefined]
  - @tinyhttp/proxy-addr@0.5.2

## 0.5.4

### Patch Changes

- Remove proxy-addr dep

## 0.5.3

### Patch Changes

- Drop proxy-addr in favor of @tinyhttp/proxy-addr
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.5.1
  - @tinyhttp/proxy-addr@0.5.1
  - @tinyhttp/req@0.5.2
  - @tinyhttp/res@0.5.2
  - @tinyhttp/router@0.5.1

## 0.5.2

### Patch Changes

- @tinyhttp/req@0.5.1
- @tinyhttp/res@0.5.1

## 0.5.1

### Patch Changes

- Use url.parse for getting url's pathname

## 0.5.0

### Minor Changes

- Release 0.5

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.5.0
  - @tinyhttp/req@0.5.0
  - @tinyhttp/res@0.5.0
  - @tinyhttp/router@0.5.0

## 0.4.18

### Patch Changes

- Add req.path

## 0.4.17

### Patch Changes

- Fix markdown recursive issue
- Updated dependencies [undefined]
  - @tinyhttp/req@0.4.5
  - @tinyhttp/res@0.4.9

## 0.4.16

### Patch Changes

- @tinyhttp/req@0.4.4
- @tinyhttp/res@0.4.8

## 0.4.15

### Patch Changes

- update core package readme

## 0.4.14

### Patch Changes

- Fix tsconfig
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.4.1
  - @tinyhttp/req@0.4.3
  - @tinyhttp/res@0.4.7
  - @tinyhttp/router@0.4.1

## 0.4.13

### Patch Changes

- Add req.originalUrl

## 0.4.12

### Patch Changes

- Forgot to bump
- Updated dependencies [undefined]
  - @tinyhttp/res@0.4.6

## 0.4.11

### Patch Changes

- Add res.append

## 0.4.10

### Patch Changes

- Add missing `Middleware` re-export

## 0.4.9

### Patch Changes

- @tinyhttp/req@0.4.2
- @tinyhttp/res@0.4.5

## 0.4.8

### Patch Changes

- @tinyhttp/req@0.4.1
- @tinyhttp/res@0.4.4

## 0.4.7

### Patch Changes

- @tinyhttp/res@0.4.3

## 0.4.6

### Patch Changes

- @tinyhttp/res@0.4.2

## 0.4.5

### Patch Changes

- Add `res.jsonp` to response interface and start documenting some methods

## 0.4.4

### Patch Changes

- Add `app.set`

## 0.4.3

### Patch Changes

- Changed the default binding address from localhost to 0.0.0.0

## 0.4.2

### Patch Changes

- Update readme

## 0.4.1

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/res@0.4.1

## 0.4.0

### Minor Changes

- Release v0.4

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.4.0
  - @tinyhttp/req@0.4.0
  - @tinyhttp/res@0.4.0
  - @tinyhttp/router@0.4.0

## 0.3.18

### Patch Changes

- @tinyhttp/req@0.1.11
- @tinyhttp/res@0.1.15

## 0.3.17

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.10
  - @tinyhttp/res@0.1.14

## 0.3.16

### Patch Changes

- Add req.acceptsLanguages, req.is and res.locals
- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.9
  - @tinyhttp/res@0.1.13

## 0.3.15

### Patch Changes

- Add req.subdomains, req.app and res.app

## 0.3.14

### Patch Changes

- Add req.subdomains

## 0.3.13

### Patch Changes

- Add `req.acceptsCharsets` and `req.acceptsEncodings`
- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.8
  - @tinyhttp/res@0.1.12

## 0.3.12

### Patch Changes

- Add res.type()
- Updated dependencies [undefined]
  - @tinyhttp/res@0.1.11

## 0.3.11

### Patch Changes

- Upgrade es-mime-types to fix res.format
- Updated dependencies [undefined]
  - @tinyhttp/res@0.1.10
  - @tinyhttp/req@0.1.7

## 0.3.10

### Patch Changes

- Move URL extensions to @tinyhttp/url
- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.6
  - @tinyhttp/res@0.1.9

## 0.3.9

### Patch Changes

- Fix missing accepts
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.2.3
  - @tinyhttp/req@0.1.5
  - @tinyhttp/res@0.1.8
  - @tinyhttp/router@0.1.3

## 0.3.8

### Patch Changes

- Fix broken release
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.2.2
  - @tinyhttp/req@0.1.4
  - @tinyhttp/res@0.1.7
  - @tinyhttp/router@0.1.2

## 0.3.7

### Patch Changes

- @tinyhttp/req@0.1.3
- @tinyhttp/res@0.1.6

## 0.3.6

### Patch Changes

- add res.redirect and res.format, transfer es-accepts to @tinyhttp/accepts
- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.2
  - @tinyhttp/res@0.1.5

## 0.3.5

### Patch Changes

- Add res.vary() method and upgrade module deps
- Updated dependencies [undefined]
  - @tinyhttp/res@0.1.4

## 0.3.4

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/router@0.1.1

## 0.3.3

### Patch Changes

- minor fixes
- Updated dependencies [undefined]
  - @tinyhttp/req@0.1.1
  - @tinyhttp/res@0.1.3

## 0.3.2

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/res@0.1.2

## 0.3.1

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.2.1
  - @tinyhttp/res@0.1.1

## 0.3.0

### Minor Changes

- - add template engine support
  - add `sendFile` function (most recent addition) and a lot of other Express methods
  - finish writing the docs
  - add "common tasks" and "advanced topics" sections to docs
  - split `@tinyhttp/app` by 4 separate framework-agnostic packages
  - setup husky and commitlint
  - add 25 examples
  - add 10 middlewares, including `@tinyhttp/session`, `@tinyhttp/ip-filter` and more

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.2.0
  - @tinyhttp/req@0.1.0
  - @tinyhttp/res@0.1.0
  - @tinyhttp/router@0.1.0

## 0.2.82

### Patch Changes

- @tinyhttp/res@0.0.5

## 0.2.81

### Patch Changes

- Add more alternatives to logger and session modules

## 0.2.80

### Patch Changes

- Implement res.sendFile
  - @tinyhttp/res@0.0.4

## 0.2.79

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/router@0.0.5

## 0.2.78

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/router@0.0.4

## 0.2.77

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/router@0.0.3

## 0.2.76

### Patch Changes

- Fix send content-type bug
  - @tinyhttp/res@0.0.3

## 0.2.75

### Patch Changes

- Add more generic options to app, create bot-detector, pug

## 0.2.74

### Patch Changes

- Fix minor issues in the router
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.20
  - @tinyhttp/router@0.0.2
  - @tinyhttp/res@0.0.2

## 0.2.73

### Patch Changes

- Split app into req, res, send and router
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.19
  - @tinyhttp/req@0.0.1
  - @tinyhttp/res@0.0.1
  - @tinyhttp/router@0.0.1

## 0.2.72

### Patch Changes

- Fix little bug with `render` ext

## 0.2.71

### Patch Changes

- oopsie

## 0.2.70

### Patch Changes

- Fix smol options error

## 0.2.69

### Patch Changes

- merge to master with engine support

## 0.2.68

### Patch Changes

- something weird, pnpm doesn't want to publish
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.18
  - @tinyhttp/cookie-signature@0.1.15
  - @tinyhttp/etag@0.2.16

## 0.2.67

### Patch Changes

- Add array is middleware support

## 0.2.66

### Patch Changes

- Create @tinyhttp/sesson

## 0.2.65

### Patch Changes

- Create ping module

## 0.2.64

### Patch Changes

- Fix some readme fields
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.17

## 0.2.63

### Patch Changes

- Upgrade examples' body-parsec dep

## 0.2.62

### Patch Changes

- Fix weird problems with internet that I couldn't publish normally
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.16
  - @tinyhttp/cookie-signature@0.1.14
  - @tinyhttp/etag@0.2.15

## 0.2.61

### Patch Changes

- Add proper sub-app support
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.15
  - @tinyhttp/cookie-signature@0.1.13
  - @tinyhttp/etag@0.2.14

## 0.2.60

### Patch Changes

- Refactor emoji option

## 0.2.59

### Patch Changes

- Remove warning not to spam in tests

## 0.2.58

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/etag@0.2.13

## 0.2.57

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.14

## 0.2.56

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.13

## 0.2.55

### Patch Changes

- Support system errors (not only http)

## 0.2.54

### Patch Changes

- Fix error handler

## 0.2.53

### Patch Changes

- Fix import

## 0.2.51

### Patch Changes

- Fix es-mime-types strange build

## 0.2.50

### Patch Changes

- Fix versions

## 0.2.49

### Patch Changes

- Fix import

## 0.2.48

### Patch Changes

- Upgrade some es-\* deps even more

## 0.2.47

### Patch Changes

- Upgrade some es-\* packages
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.12
  - @tinyhttp/cookie-signature@0.1.12
  - @tinyhttp/etag@0.2.12

## 0.2.46

### Patch Changes

- Upgrade deps
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.11
  - @tinyhttp/cookie-signature@0.1.11
  - @tinyhttp/etag@0.2.11

## 0.2.45

### Patch Changes

- add "!"

## 0.2.43

### Patch Changes

- remove console.log

## 0.2.42

### Patch Changes

- Fix #22

## 0.2.41

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.10
  - @tinyhttp/cookie-signature@0.1.10
  - @tinyhttp/etag@0.2.10

## 0.2.39

### Patch Changes

- Move from rollup to tsup
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.9
  - @tinyhttp/cookie-signature@0.1.9
  - @tinyhttp/etag@0.2.9

## 0.2.34

### Patch Changes

- Remove looping
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.8
  - @tinyhttp/cookie-signature@0.1.8
  - @tinyhttp/etag@0.2.8

## 0.2.33

### Patch Changes

- Remove --compact flag
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.7
  - @tinyhttp/cookie-signature@0.1.7
  - @tinyhttp/etag@0.2.7

## 0.2.32

### Patch Changes

- Compress whitespace
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.6
  - @tinyhttp/cookie-signature@0.1.6
  - @tinyhttp/etag@0.2.6

## 0.2.31

### Patch Changes

- Add --compact flag
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.5
  - @tinyhttp/cookie-signature@0.1.5
  - @tinyhttp/etag@0.2.5

## 0.2.30

### Patch Changes

- Mess with dispatch and fix undefined props

## 0.2.28

### Patch Changes

- Fix extend func order

## 0.2.27

### Patch Changes

- Still mess with the loop()

## 0.2.26

### Patch Changes

- Fix options being undefined

## 0.2.21

### Patch Changes

- Refactor logger

## 0.2.19

### Patch Changes

- Add JSDoc declarations and fix Promise error

## 0.2.18

### Patch Changes

- Upgrade dependencies of all of the packages
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.4
  - @tinyhttp/cookie-signature@0.1.4
  - @tinyhttp/etag@0.2.4

## 0.2.13

### Patch Changes

- Fix async/await bug

## 0.2.12

### Patch Changes

- Still trying to fix that bug

## 0.2.11

### Patch Changes

- Fix another similar bug

## 0.2.10

### Patch Changes

- FINALLY FIX THAT BUG WHERE 404 COULDN'T BE FOUND

## 0.2.9

### Patch Changes

- Rebuild trying to fix the latest bug

## 0.2.8

### Patch Changes

- Fix first no matcj

## 0.2.7

### Patch Changes

- Fix Terser options
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.3
  - @tinyhttp/cookie-signature@0.1.3
  - @tinyhttp/etag@0.2.3

## 0.2.6

### Patch Changes

- Return compression back
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.2
  - @tinyhttp/cookie-signature@0.1.2
  - @tinyhttp/etag@0.2.2

## 0.2.5

### Patch Changes

- Put undefined in the next function

## 0.2.4

### Patch Changes

- Fix #12 issue with type conflict

## 0.2.3

### Patch Changes

- Fix readme field
- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.1
  - @tinyhttp/cookie-signature@0.1.1
  - @tinyhttp/etag@0.2.1

## 0.2.0

### Minor Changes

- Move to changesets

### Patch Changes

- Updated dependencies [undefined]
  - @tinyhttp/cookie@0.1.0
  - @tinyhttp/cookie-signature@0.1.0
  - @tinyhttp/etag@0.2.0
