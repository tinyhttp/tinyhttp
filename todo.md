# Express implementation TODO

## App

### Properties

- [x] `app.locals`
- [ ] `app.mountpath`
- [ ] `app.router`

### Methods

- [x] `app.all()`
- [x] `app.delete()`
- [ ] `app.disable()`
- [ ] `app.disabled()`
- [ ] `app.enable()`
- [ ] `app.enabled()`
- [ ] `app.engine()`
- [x] `app.get()`
- [x] `app.listen()`
- [ ] `app.METHOD()`
- [ ] `app.param()`
- [ ] `app.path()`
- [x] `app.post()`
- [x] `app.put()`
- [ ] `app.render()`
- [ ] `app.route()`
- [ ] `app.set()`
- [x] `app.use()`

## Request

### Properties

- [x] `req.app`
- [ ] `req.baseUrl`
- [ ] `req.body`
- [x] `req.cookies`
- [ ] `req.fresh`
- [x] `req.hostname`
- [x] `req.ip`
- [ ] `req.ips`
- [x] `req.method`
- [ ] `req.originalUrl`
- [x] `req.params`
- [ ] `req.path`
- [x] `req.protocol`
- [x] `req.query`
- [x] `req.route`
- [x] `req.secure`
- [x] `req.signedCookies`
- [ ] `req.stale`
- [ ] `req.subdomains`
- [x] `req.xhr`

### Methods

- [ ] `req.accepts()`
- [ ] `req.acceptsCharsets()`
- [ ] `req.acceptsEncodings()`
- [ ] `req.acceptsLanguages()`
- [x] `req.get()`
- [ ] `req.is()`
- [x] `req.range()`

## Response

### Properties

- [x] `res.app`
- [ ] `res.headersSent`
- [ ] `res.locals`

### Methods

- [ ] `res.append()`
- [ ] `res.attachment()`
- [x] `res.cookie()`
- [x] `res.clearCookie()`
- [ ] `res.download()`
- [x] `res.end()`
- [ ] `res.format()`
- [x] `res.get()`
- [x] `res.json()`
- [ ] `res.jsonp()`
- [ ] `res.links()`
- [x] `res.location()`
- [ ] `res.redirect()`
- [ ] `res.render()`
- [x] `res.send()`
- [ ] `res.sendFile()`
- [ ] `res.sendStatus()`
- [x] `res.set()`
- [x] `res.status()`
- [ ] `res.type()`
- [ ] `res.vary()`

## Router

Router is not yet implemented as a separate thing but will be in the near future.

- [ ] `router.all()`
- [ ] `router.METHOD()`
- [ ] `router.param()`
- [ ] `router.route()`
- [ ] `router.use()`
