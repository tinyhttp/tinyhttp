import { favicon, FaviconOptions } from '../../packages/favicon/src'
import http from 'http'
import path from 'path'
import request from 'supertest'

const FAVICON_PATH = path.join(__dirname, '../fixtures/favicon.ico')

function createServer(path?: string | Buffer, opts?: Omit<FaviconOptions, 'path'>) {
  const _path = path || FAVICON_PATH
  const _favicon = favicon(_path, opts)
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
        expect(await favicon(Buffer.alloc(20))).not.toThrow()
      })
      it('should not be dir', async () => {
        try {
          await favicon(__dirname)
        } catch (e) {
          expect((e as NodeJS.ErrnoException).message).toMatch(/EISDIR, illegal operation on directory/)
        }
      })
      it('should exist', async () => {
        try {
          await favicon('nothing')
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

    describe('requests', () => {
      let server: http.Server

      beforeEach(() => {
        server = createServer()
      })

      it('should serve icon', (done) => {
        request(server).get('/favicon.ico').expect('Content-Type', 'image/x-icon').expect(200, done)
      })

      it('should include cache-control', (done) => {
        request(server)
          .get('/favicon.ico')
          .expect('Cache-Control', /public/)
          .expect(200, done)
      })

      it('should include strong etag', (done) => {
        request(server)
          .get('/favicon.ico')
          .expect('ETag', /^"[^"]+"$/)
          .expect(200, done)
      })

      it('should deny POST', (done) => {
        request(server).post('/favicon.ico').expect('Allow', 'GET, HEAD, OPTIONS').expect(405, done)
      })

      it('should understand OPTIONS', (done) => {
        request(server).options('/favicon.ico').expect('Allow', 'GET, HEAD, OPTIONS').expect(200, done)
      })

      it('should 304 when If-None-Match matches', (done) => {
        request(server)
          .get('/favicon.ico')
          .expect(200, (err, res) => {
            if (err) return done(err)
            request(server).get('/favicon.ico').set('If-None-Match', res.headers.etag).expect(304, done)
          })
      })

      it('should 304 when If-None-Match matches weakly', (done) => {
        request(server)
          .get('/favicon.ico')
          .expect(200, (err, res) => {
            if (err) return done(err)
            request(server)
              .get('/favicon.ico')
              .set('If-None-Match', 'W/' + res.headers.etag)
              .expect(304, done)
          })
      })

      it('should ignore non-favicon requests', (done) => {
        request(server).get('/').expect(404, 'oops', done)
      })

      it('should work with query string', (done) => {
        request(server).get('/favicon.ico?v=1').expect('Content-Type', 'image/x-icon').expect(200, done)
      })
    })

    describe('icon', function () {
      describe('buffer', () => {
        it('should be served from buffer', function (done) {
          const buffer = Buffer.alloc(20, '#')
          const server = createServer(buffer)

          request(server).get('/favicon.ico').expect('Content-Length', '20').expect(200, buffer, done)
        })

        it('should be copied', function (done) {
          const buffer = Buffer.alloc(20, '#')
          const server = createServer(buffer)

          expect(buffer.toString()).toStrictEqual('####################')
          buffer.fill('?')
          expect(buffer.toString()).toStrictEqual('????????????????????')

          request(server).get('/favicon.ico').expect('Content-Length', '20').expect(200, Buffer.from('####################'), done)
        })
      })
    })
  })
})
