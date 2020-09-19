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
