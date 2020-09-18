import { SessionManager, MemoryStore } from '../../packages/session/src'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'

describe('session()', () => {
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
})
