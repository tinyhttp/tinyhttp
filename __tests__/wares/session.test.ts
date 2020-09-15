import { SessionManager, MemoryStore } from '../../packages/session/src'
import { InitAppAndTest } from '../app.test'

describe('session()', () => {
  it('should work', async (done) => {
    const store = new MemoryStore()
    const getSession = SessionManager({
      store,
      secret: 'test',
    })

    const { request } = InitAppAndTest(async (req, res) => {
      const session = await getSession(req, res)

      if (!session.test) {
        session.test = 1
      } else {
        session.test += 1
      }

      res.json({ t: session.test })
    })

    request.get('/').expect({ t: 1 }, done)
  })
})
