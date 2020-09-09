import { favicon, FaviconOptions } from '../../packages/favicon/src'
import http from 'http'
import path from 'path'
import request from 'supertest'

const FAVICON_PATH = path.join(__dirname, '../fixtures/favicon.ico')

function createServer(path?: string, opts?: Omit<FaviconOptions, 'path'>) {
  const _path = path || FAVICON_PATH
  const _favicon = favicon({
    path: _path,
    ...opts,
  })
  const server = http.createServer(
    async (req, res) =>
      void (await _favicon)(req, res, (err) => {
        res.statusCode = err ? err.status || 500 : 404
        res.end(err ? err.message : 'oops')
      })
  )

  return server
}

describe('favicon function test', () => {
  describe('args', () => {
    describe('path', () => {
      it('should be required', async () => {
        try {
          // @ts-ignore
          await favicon()
        } catch (e) {
          expect((e as TypeError).message).toBe('path to favicon.ico is required')
        }
      })
      it('should accept buffer', async () => {
        expect(
          await favicon({
            path: Buffer.alloc(20),
          })
        ).not.toThrow()
      })
      it('should not be dir', async () => {
        try {
          await favicon({
            path: __dirname,
          })
        } catch (e) {
          expect((e as NodeJS.ErrnoException).message).toMatch(/EISDIR, illegal operation on directory/)
        }
      })
      it('should exist', async () => {
        try {
          await favicon({
            path: 'nothing',
          })
        } catch (e) {
          expect((e as NodeJS.ErrnoException).message).toMatch(/ENOENT/)
        }
      })
    })
    describe('options.maxAge', function () {
      it('should be in cache-control', function (done) {
        const server = createServer(null, { maxAge: 5000 })
        request(server).get('/favicon.ico').expect('Cache-Control', 'public, max-age=5').expect(200, done)
      })

      it('should have a default', function (done) {
        const server = createServer()
        request(server)
          .get('/favicon.ico')
          .expect('Cache-Control', /public, max-age=[0-9]+/)
          .expect(200, done)
      })

      it('should accept 0', function (done) {
        const server = createServer(null, { maxAge: 0 })
        request(server).get('/favicon.ico').expect('Cache-Control', 'public, max-age=0').expect(200, done)
      })

      it('should accept string', function (done) {
        const server = createServer(null, { maxAge: '30d' })
        request(server).get('/favicon.ico').expect('Cache-Control', 'public, max-age=2592000').expect(200, done)
      })

      it('should be valid delta-seconds', function (done) {
        const server = createServer(null, { maxAge: 1234 })
        request(server).get('/favicon.ico').expect('Cache-Control', 'public, max-age=1').expect(200, done)
      })
    })
  })
})
