import { SessionManager, MemoryStore } from '../../packages/session/src'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'

describe('SessionManager(opts)', () => {
  it('should error without secret', async () => {
    const store = new MemoryStore()

    try {
      SessionManager({
        store,
        secret: undefined,
      })
    } catch (e) {
      expect((e as TypeError).message).toMatch(/requires/i)
    }
  })
})

describe('getSession(req, res)', () => {
  it('should work', async () => {
    const store = new MemoryStore()
    const getSession = SessionManager({
      store,
      secret: 'test',
    })

    const { fetch } = InitAppAndTest(async (req, res) => {
      const session = await getSession(req, res)

      if (!session.test) {
        session.test = 1
      } else {
        session.test += 1
      }

      res.json({ t: session.test })
    })

    await fetch('/').expect({ t: 1 })
  })

  describe('session.save(cb)', () => {
    it('should save session to store', async () => {
      const store = new MemoryStore()

      const getSession = SessionManager({
        store,
        secret: 'test',
      })

      const { fetch } = InitAppAndTest(async (req, res) => {
        const session = await getSession(req, res)

        session.save((err) => {
          if (err) {
            return res.end(err.message)
          }

          store.get(session.id, (err, sess) => {
            if (err) {
              return res.end(err.message)
            }

            res.end(sess ? 'stored' : 'empty')
          })
        })
      })

      await fetch('/').expectStatus(200).expectBody('stored')
    })

    it('should prevent end-of-request save', async () => {
      const store = new MemoryStore()

      const _set = store.set

      let setCount = 0

      store.set = function set(...args) {
        setCount++

        return _set.apply(this, args)
      }

      const getSession = SessionManager({
        store,
        secret: 'test',
      })

      const { fetch } = InitAppAndTest(async (req, res) => {
        const session = await getSession(req, res)

        session.save((err) => {
          if (err) {
            return res.end(err.message)
          }

          res.end('saved')
        })
      })

      await fetch('/').expectStatus(200).expectBody('saved')

      expect(setCount).toBe(1)
    })

    it('should prevent end-of-request save on reloaded session', async () => {
      const store = new MemoryStore()

      const _set = store.set

      let setCount = 0

      store.set = function set(...args) {
        setCount++

        return _set.apply(this, args)
      }

      const getSession = SessionManager({
        store,
        secret: 'test',
      })

      const { fetch } = InitAppAndTest(async (req, res) => {
        const session = await getSession(req, res)

        session.reload(() => {
          session.save((err) => {
            if (err) {
              return res.end(err.message)
            }

            res.end('saved')
          })
        })
      })

      await fetch('/').expectStatus(200).expectBody('saved')

      expect(setCount).toBe(1)
    })
  })
})
