import { describe, expect, it } from '@jest/globals'
import { SessionManager, MemoryStore } from '../../../packages/session/src'

describe('SessionManager(opts)', () => {
  it('should error without secret', async () => {
    const store = new MemoryStore()

    try {
      SessionManager({
        store,
        secret: undefined
      })
    } catch (e) {
      expect((e as TypeError).message).toMatch(/requires/i)
    }
  })
})
