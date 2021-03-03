/* eslint-disable @typescript-eslint/no-empty-function */
import { Response } from '../../packages/app/src'
import { Router } from '../../packages/router/src'
import { METHODS } from 'http'

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
        type: 'mw'
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
      const app = new Router<Router>()

      app.use((_req, _res, next) => next(), [(_req, _res, next) => next(), (_req, _res, next) => next()])

      expect(app.middleware).toHaveLength(3)
    })
    it('accepts an array of wares as a first argument', () => {
      const app = new Router<Router>()

      app.use([(_req, _res, next) => next(), (_req, _res, next) => next()])

      expect(app.middleware).toHaveLength(2)
    })
    it('accepts an array of wares and path as first argument', () => {
      const app = new Router<Router>()

      app.use('/path', [(_req, _res, next) => next(), (_req, _res, next) => next()])

      expect(app.middleware).toHaveLength(2)

      expect(app.middleware.every((x) => x.path === '/path')).toBe(true)
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
    it('middlewares of a subapp get prefixed with mountpath', () => {
      const app = new Router<Router>()

      const subapp = new Router<Router>()

      subapp.use('/path', (_req, _res) => void 0)

      app.use('/subapp', subapp)

      expect(subapp.middleware[0].path).toBe('/subapp/path')
    })
  })
})

describe('Testing HTTP methods', () => {
  it('should accept arrays for first second arg', () => {
    const router = new Router()

    router.get('/', [() => 0, () => 0])

    expect(router.middleware.length).toBe(2)
  })
  it('should accept arrays for third argument', () => {
    const router = new Router()

    router.get('/', () => 0, [() => 0, () => 0])

    expect(router.middleware.length).toBe(3)
  })

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
  it('app.acl should set ACL as HTTP method', () => {
    const router = new Router()

    router.acl('/', () => void 0)

    expect(router.middleware[0].method).toBe('ACL')
  })
  it('app.bind should set BIND as HTTP method', () => {
    const router = new Router()

    router.bind('/', () => void 0)

    expect(router.middleware[0].method).toBe('BIND')
  })

  it('app.checkout should set CHECKOUT as HTTP method', () => {
    const router = new Router()

    router.checkout('/', () => void 0)

    expect(router.middleware[0].method).toBe('CHECKOUT')
  })

  it('app.copy should set COPY as HTTP method', () => {
    const router = new Router()

    router.copy('/', () => void 0)

    expect(router.middleware[0].method).toBe('COPY')
  })

  it('app.lock should set LOCK as HTTP method', () => {
    const router = new Router()

    router.lock('/', () => void 0)

    expect(router.middleware[0].method).toBe('LOCK')
  })

  it('app.unlock should set UNLOCK as HTTP method', () => {
    const router = new Router()

    router.unlock('/', () => void 0)

    expect(router.middleware[0].method).toBe('UNLOCK')
  })

  it('app.merge should set MERGE as HTTP method', () => {
    const router = new Router()

    router.merge('/', () => void 0)

    expect(router.middleware[0].method).toBe('MERGE')
  })

  it('app.mkactivity should set MKACTIVITY as HTTP method', () => {
    const router = new Router()

    router.mkactivity('/', () => void 0)

    expect(router.middleware[0].method).toBe('MKACTIVITY')
  })
  it('app.mkcol should set MKCOL as HTTP method', () => {
    const router = new Router()

    router.mkcol('/', () => void 0)

    expect(router.middleware[0].method).toBe('MKCOL')
  })

  it('app.move should set MOVE as HTTP method', () => {
    const router = new Router()

    router.move('/', () => void 0)

    expect(router.middleware[0].method).toBe('MOVE')
  })

  it('app.search should set SEARCH as HTTP method', () => {
    const router = new Router()

    router.search('/', () => void 0)

    expect(router.middleware[0].method).toBe('SEARCH')
  })

  it('app.msearch should set M-SEARCH as HTTP method', () => {
    const router = new Router()

    router.msearch('/', () => void 0)

    expect(router.middleware[0].method).toBe('M-SEARCH')
  })

  it('app.notify should set NOTIFY as HTTP method', () => {
    const router = new Router()

    router.notify('/', () => void 0)

    expect(router.middleware[0].method).toBe('NOTIFY')
  })

  it('app.notify should set NOTIFY as HTTP method', () => {
    const router = new Router()

    router.notify('/', () => void 0)

    expect(router.middleware[0].method).toBe('NOTIFY')
  })

  it('app.purge should set PURGE as HTTP method', () => {
    const router = new Router()

    router.purge('/', () => void 0)

    expect(router.middleware[0].method).toBe('PURGE')
  })

  it('app.report should set REPORT as HTTP method', () => {
    const router = new Router()

    router.report('/', () => void 0)

    expect(router.middleware[0].method).toBe('REPORT')
  })

  it('app.subscribe should set SUBSCRIBE as HTTP method', () => {
    const router = new Router()

    router.subscribe('/', () => void 0)

    expect(router.middleware[0].method).toBe('SUBSCRIBE')
  })

  it('app.unsubscribe should set UNSUBSCRIBE as HTTP method', () => {
    const router = new Router()

    router.unsubscribe('/', () => void 0)

    expect(router.middleware[0].method).toBe('UNSUBSCRIBE')
  })

  it('app.trace should set TRACE as HTTP method', () => {
    const router = new Router()

    router.trace('/', () => void 0)

    expect(router.middleware[0].method).toBe('TRACE')
  })

  it('app.acl should set ACL as HTTP method', () => {
    const router = new Router()

    router.acl('/', () => void 0)

    expect(router.middleware[0].method).toBe('ACL')
  })

  it('app.connect should set CONNECT as HTTP method', () => {
    const router = new Router()

    router.connect('/', () => void 0)

    expect(router.middleware[0].method).toBe('CONNECT')
  })

  it('app.bind should set BIND as HTTP method', () => {
    const router = new Router()

    router.bind('/', () => void 0)

    expect(router.middleware[0].method).toBe('BIND')
  })

  it('app.unbind should set UNBIND as HTTP method', () => {
    const router = new Router()

    router.unbind('/', () => void 0)

    expect(router.middleware[0].method).toBe('UNBIND')
  })

  it('app.rebind should set REBIND as HTTP method', () => {
    const router = new Router()

    router.rebind('/', () => void 0)

    expect(router.middleware[0].method).toBe('REBIND')
  })

  it('app.link should set LINK as HTTP method', () => {
    const router = new Router()

    router.link('/', () => void 0)

    expect(router.middleware[0].method).toBe('LINK')
  })

  it('app.unlink should set UNLINK as HTTP method', () => {
    const router = new Router()

    router.unlink('/', () => void 0)

    expect(router.middleware[0].method).toBe('UNLINK')
  })

  it('app.mkcalendar should set MKCALENDAR as HTTP method', () => {
    const router = new Router()

    router.mkcalendar('/', () => void 0)

    expect(router.middleware[0].method).toBe('MKCALENDAR')
  })

  it('app.propfind should set PROPFIND as HTTP method', () => {
    const router = new Router()

    router.propfind('/', () => void 0)

    expect(router.middleware[0].method).toBe('PROPFIND')
  })

  it('app.proppatch should set PROPPATCH as HTTP method', () => {
    const router = new Router()

    router.proppatch('/', () => void 0)

    expect(router.middleware[0].method).toBe('PROPPATCH')
  })

  it('app.source should set SOURCE as HTTP method', () => {
    const router = new Router()

    router.source('/', () => void 0)

    expect(router.middleware[0].method).toBe('SOURCE')
  })

  it('app.all should push all HTTP methods handlers', () => {
    const router = new Router()

    router.all('/', () => void 0)

    expect(router.middleware.map((x) => x.method).length).toBe(METHODS.length)
  })
})

/* describe('Testing Router methods', () => {

})
 */
