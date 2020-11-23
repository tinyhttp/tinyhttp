import { MemoryStore } from '../../../packages/session/src'

describe('store.set(id, session)', () => {
  it('should commit the session with the given ID and session object', () => {
    const store = new MemoryStore()

    store.set('hello', {
      a: 'b',
    })

    store.get('hello', (_, session) => {
      expect(session).toStrictEqual({ a: 'b' })
    })
  })
})

describe('store.get(id, cb)', () => {
  it('should fetch the session with the specified ID', () => {
    const store = new MemoryStore()

    store.set('hello', {
      a: 'b',
    })

    store.get('hello', (_, session) => {
      expect(session).toStrictEqual({ a: 'b' })
    })
  })
})

describe('session.length(cb)', () => {
  it('should return the number of active sessions', () => {
    const store = new MemoryStore()

    store.set('hello', {
      a: 'b',
    })

    store.set('world', {
      c: 'd',
    })

    store.length((_, length) => expect(length).toBe(2))
  })
})

describe('session.clear(cb)', () => {
  it('should clear all sessions', () => {
    const store = new MemoryStore()

    store.set('hello', {
      a: 'b',
    })

    store.set('world', {
      c: 'd',
    })

    store.clear()

    store.length((_, length) => expect(length).toBe(0))
  })
})
