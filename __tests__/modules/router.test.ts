/* eslint-disable @typescript-eslint/no-empty-function */
import { Response } from '../../packages/app/src'
import { Router } from '../../packages/router/src'

describe('Testing Router', () => {
  describe('Basic', () => {
    it('new router has empty ware array', () => {
      const app = new Router()

      expect(app.middleware).toStrictEqual([])
    })
  })
  describe('.use method', () => {
    it('new ware gets added via .use', () => {
      const app = new Router()

      app.use((_: unknown, res: Response) => res.end('hi'))

      expect(app.middleware[0]).toMatchObject({
        path: '/',
        type: 'mw',
      })
    })
    it('accepts a list of wares', () => {
      const app = new Router()

      app.use(
        function m1(_req, _res, next) {
          next()
        },
        function m2(_req, _res, next) {
          next()
        },
        function m3(_req, _res, next) {
          next()
        }
      )

      expect(app.middleware).toHaveLength(3)
    })
    it('accepts an array of wares', () => {
      const app = new Router()

      app.use(
        function m1(_req, _res, next) {
          next()
        },
        [
          function m2(_req, _res, next) {
            next()
          },
          function m3(_req, _res, next) {
            next()
          },
        ]
      )

      expect(app.middleware).toHaveLength(3)
    })
  })
  describe('Subapps', () => {
    it('should mount app on a specified path', () => {
      const app = new Router<Router>()

      const subapp = new Router()

      app.use('/subapp', subapp)

      expect(subapp.mountpath).toBe('/subapp')
    })
    it('should mount on "/" if path is not specified', () => {
      const app = new Router<Router>()

      const subapp = new Router()

      app.use(subapp)

      expect(subapp.mountpath).toBe('/')
    })
    it('app.parent should reference to the app it was mounted on', () => {
      const app = new Router<Router>()

      const subapp = new Router()

      app.use(subapp)

      expect(subapp.parent).toBe(app)
    })
    it('app.path() should return the mountpath', () => {
      const app = new Router<Router>()

      const subapp = new Router()

      app.use('/subapp', subapp)

      expect(subapp.path()).toBe('/subapp')
    })
    it('app.path() should nest mountpaths', () => {
      const app = new Router<Router>()

      const subapp = new Router<Router>()

      const subsubapp = new Router()

      subapp.use('/admin', subsubapp)

      app.use('/blog', subapp)

      expect(subsubapp.path()).toBe('/blog/admin')
    })
  })
})

describe('Testing HTTP methods', () => {
  it('app.get should set GET as HTTP method', () => {
    const router = new Router()

    router.get('/', () => void 0)

    expect(router.middleware[0].method).toBe('GET')
  })
  it('app.post should set POST as HTTP method', () => {
    const router = new Router()

    router.post('/', () => void 0)

    expect(router.middleware[0].method).toBe('POST')
  })
  it('app.put should set PUT as HTTP method', () => {
    const router = new Router()

    router.put('/', () => void 0)

    expect(router.middleware[0].method).toBe('PUT')
  })
  it('app.patch should set PATCH as HTTP method', () => {
    const router = new Router()

    router.patch('/', () => void 0)

    expect(router.middleware[0].method).toBe('PATCH')
  })
  it('app.delete should set DELETE as HTTP method', () => {
    const router = new Router()

    router.delete('/', () => void 0)

    expect(router.middleware[0].method).toBe('DELETE')
  })
  it('app.head should set HEAD as HTTP method', () => {
    const router = new Router()

    router.head('/', () => void 0)

    expect(router.middleware[0].method).toBe('HEAD')
  })
  it('app.options should set OPTIONS as HTTP method', () => {
    const router = new Router()

    router.options('/', () => void 0)

    expect(router.middleware[0].method).toBe('OPTIONS')
  })
  it('app.all should push all HTTP methods handlers', () => {
    const router = new Router()

    router.all('/', () => void 0)

    expect(router.middleware.map((x) => x.method)).toEqual([
      'ACL',
      'BIND',
      'CHECKOUT',
      'CONNECT',
      'COPY',
      'DELETE',
      'GET',
      'HEAD',
      'LINK',
      'LOCK',
      'M-SEARCH',
      'MERGE',
      'MKACTIVITY',
      'MKCALENDAR',
      'MKCOL',
      'MOVE',
      'NOTIFY',
      'OPTIONS',
      'PATCH',
      'POST',
      'PRI',
      'PROPFIND',
      'PROPPATCH',
      'PURGE',
      'PUT',
      'REBIND',
      'REPORT',
      'SEARCH',
      'SOURCE',
      'SUBSCRIBE',
      'TRACE',
      'UNBIND',
      'UNLINK',
      'UNLOCK',
      'UNSUBSCRIBE',
    ])
  })
})

describe('Testing Router methods', () => {
  describe('app.route(path)', () => {
    it('should mount a router on a subpath', () => {
      const app = new Router<Router>()

      app.route('/path')

      expect(app.apps['/path']).not.toBeUndefined()
    })
    it('should provide methods as a regular app', () => {
      const app = new Router<Router>()

      app
        .route('/path')
        .get('/get', () => {})
        .use('/mw')

      expect(app.apps['/path'].middleware).toHaveLength(2)
    })
  })
})
