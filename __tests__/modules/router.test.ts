import { Request, Response } from '../../packages/app/src'
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
  })
})
