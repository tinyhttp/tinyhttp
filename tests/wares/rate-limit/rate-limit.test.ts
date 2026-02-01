import { makeFetch } from 'supertest-fetch'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../../packages/app/src'
import { rateLimit } from '../../../packages/rate-limit/src'

function createAppWith(middleware) {
  const app = new App()
  app.use(middleware)
  app.get('/', (_, res) => res.send('response!'))
  return app.listen()
}

describe('rate-limit', () => {
  describe('request counting', () => {
    it('should let the first request through', async () => {
      const server = createAppWith(rateLimit({ max: 1 }))

      await makeFetch(server)('/')
        .expect(200)
        .expect(/response!/)
    })

    it('should call increase on the store', async () => {
      const store = new MockStore()

      const app = createAppWith(
        rateLimit({
          store: store
        })
      )

      expect(store.incr_was_called).toBeFalsy()
      await makeFetch(app)('/')
      expect(store.incr_was_called).toBeTruthy()
    })

    it('should call resetKey on the store', async () => {
      const store = new MockStore()
      const limiter = rateLimit({
        store: store
      })

      expect(store.resetKey_was_called).toBeFalsy()
      limiter.resetKey('key')
      expect(store.resetKey_was_called).toBeTruthy()
    })

    it('should refuse additional connections once IP has reached the max', async () => {
      const app = createAppWith(
        rateLimit({
          max: 2
        })
      )
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)
    })

    it('should show the provided message instead of the default message when max connections are reached', async () => {
      const message = 'Test ratelimit message'
      const app = createAppWith(
        rateLimit({
          max: 2,
          message
        })
      )
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429).expect(message)
    })

    it.skip('should accept new connections from a blocked IP after block interval', async () => {
      vi.useFakeTimers()
      const app = createAppWith(
        rateLimit({
          max: 2,
          windowMs: 500
        })
      )

      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)
      vi.advanceTimersByTime(600)
      await makeFetch(app)('/').expect(200)
    })

    it.skip('should work repeatedly', async () => {
      vi.useFakeTimers()

      const app = createAppWith(
        rateLimit({
          max: 2,
          windowMs: 50
        })
      )

      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)
      vi.advanceTimersByTime(600)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)
      vi.advanceTimersByTime(600)
    })

    it('should allow the error statusCode to be customized', async () => {
      const errStatusCode = 456
      const app = createAppWith(
        rateLimit({
          max: 1,
          statusCode: errStatusCode
        })
      )
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(errStatusCode)
    })

    it('should decrement hits with failed response and skipFailedRequests', async () => {
      const store = new MockStore()
      const app = createAppWith(
        rateLimit({
          skipFailedRequests: true,
          store: store
        })
      )

      await makeFetch(app)('/errorPage').expect(404)
      expect(store.decrement_was_called).toBeTruthy()
    })

    it('should decrement hits with success response and skipSuccessfulRequests', async () => {
      const store = new MockStore()
      const app = createAppWith(
        rateLimit({
          skipSuccessfulRequests: true,
          store: store
        })
      )

      await makeFetch(app)('/').expect(200)
      expect(store.decrement_was_called).toBeTruthy()
    })
  })

  describe('headers', () => {
    it('should send correct x-ratelimit-limit, x-ratelimit-remaining, and x-ratelimit-reset headers', async () => {
      const limit = 5
      const windowMs = 60 * 1000

      const server = createAppWith(rateLimit({ max: limit, windowMs }))

      const expectedRemaining = 4
      const expectedResetTimestamp = Math.ceil((Date.now() + windowMs) / 1000).toString()
      const resetRegexp = new RegExp(`${expectedResetTimestamp.slice(0, expectedResetTimestamp.length - 2)}\\d\\d`)

      await makeFetch(server)('/')
        .expect('x-ratelimit-limit', limit)
        .expect('x-ratelimit-remaining', expectedRemaining.toString())
        .expect('x-ratelimit-reset', resetRegexp)
        .expect(200, /response!/)
    })

    it('should send correct ratelimit-limit, ratelimit-remaining, and ratelimit-reset headers', async () => {
      const limit = 5
      const windowMs = 60 * 1000
      const app = createAppWith(
        rateLimit({
          windowMs: windowMs,
          max: limit,
          draftPolliRatelimitHeaders: true
        })
      )
      const expectedRemaining = 4
      const expectedResetSeconds = 60
      await makeFetch(app)('/')
        .expect('ratelimit-limit', limit.toString())
        .expect('ratelimit-remaining', expectedRemaining.toString())
        .expect('ratelimit-reset', expectedResetSeconds.toString())
        .expect(200, /response!/)
    })

    it('should return the Retry-After header once IP has reached the max', async () => {
      const windowSeconds = 60

      const app = createAppWith(
        rateLimit({
          windowMs: windowSeconds * 1000,
          max: 1
        })
      )
      await makeFetch(app)('/').expect(200)

      await makeFetch(app)('/').expect(429).expect('retry-after', windowSeconds.toString())
    })

    it('catches errors and calls nextFunction', async () => {
      const app = createAppWith(
        rateLimit({
          max: 2,
          store: {
            incr: () => {
              throw Error
            },

            resetKey: () => {},
            decrement: () => {},
            resetAll: () => {}
          }
        })
      )

      await makeFetch(app)('/').expect(500)
    })

    it('should call shouldSkip if provided', async () => {
      const shouldSkip = vi.fn(() => false)

      const app = createAppWith(
        rateLimit({
          shouldSkip,
          max: 2
        })
      )

      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)

      shouldSkip.mockReturnValue(true)

      await makeFetch(app)('/').expect(200)

      expect(shouldSkip).toHaveBeenCalled()
    })

    it('should support max as an async function', async () => {
      const maxFn = vi.fn(async () => 2)

      const app = createAppWith(
        rateLimit({
          max: maxFn
        })
      )

      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(200)
      await makeFetch(app)('/').expect(429)

      expect(maxFn).toHaveBeenCalled()
    })

    it('should not decrement on successful requests when skipFailedRequests is true', async () => {
      const store = new MockStore()
      const app = createAppWith(
        rateLimit({
          skipFailedRequests: true,
          store: store
        })
      )

      await makeFetch(app)('/').expect(200)
      // decrement should NOT be called for successful requests with skipFailedRequests
      expect(store.decrement_was_called).toBeFalsy()
    })

    it('should not decrement on failed requests when skipSuccessfulRequests is true', async () => {
      const store = new MockStore()
      const app = createAppWith(
        rateLimit({
          skipSuccessfulRequests: true,
          store: store
        })
      )

      await makeFetch(app)('/errorPage').expect(404)
      // decrement should NOT be called for failed requests with skipSuccessfulRequests
      expect(store.decrement_was_called).toBeFalsy()
    })

    it('should call onLimitReached when limit is first reached', async () => {
      const onLimitReached = vi.fn()

      const app = createAppWith(
        rateLimit({
          max: 1,
          onLimitReached
        })
      )

      await makeFetch(app)('/').expect(200)
      expect(onLimitReached).not.toHaveBeenCalled()

      await makeFetch(app)('/').expect(429)
      expect(onLimitReached).toHaveBeenCalledTimes(1)

      // Should not call again on subsequent requests
      await makeFetch(app)('/').expect(429)
      expect(onLimitReached).toHaveBeenCalledTimes(1)
    })

    it('should handle store error in incr callback', async () => {
      const errorStore = {
        incr: (_, cb) => {
          cb(new Error('Store error'), 0, new Date())
        },
        resetKey: () => {},
        decrement: () => {},
        resetAll: () => {}
      }

      const app = createAppWith(
        rateLimit({
          store: errorStore
        })
      )

      await makeFetch(app)('/').expect(500)
    })

    it('should not send headers when headers option is false and rate limited', async () => {
      const app = new App()
      app.use(rateLimit({ max: 1, headers: false }))
      app.get('/', (_, res) => res.send('response!'))
      const server = app.listen()

      await makeFetch(server)('/').expect(200)
      const response = await makeFetch(server)('/').expect(429)
      expect(response.headers.get('retry-after')).toBeNull()
    })
  })
})

class MockStore {
  incr_was_called = false
  resetKey_was_called = false
  decrement_was_called = false
  counter = 0

  incr = async (_, cb) => {
    this.counter++
    this.incr_was_called = true

    cb(null, { current: this.counter, resetTime: new Date() })
  }

  decrement = () => {
    this.counter--
    this.decrement_was_called = true
  }

  resetKey = () => {
    this.resetKey_was_called = true
    this.counter = 0
  }

  resetAll = () => {}
}
