import { MemoryStore } from '../../../packages/rate-limit/src'

const key = '127.0.0.1'

describe('MemoryStore store', () => {
  it('sets the value to 1 on first incr', async () => {
    const store = new MemoryStore(-1)

    assertCurrentAfterIncrement(await store.increment(key), 1)
  })

  it('increments the key for the store each increment', async () => {
    const store = new MemoryStore(-1)

    await store.increment(key)
    assertCurrentAfterIncrement(await store.increment(key), 2)
  })

  it('resets the key for the store when used with resetKey', async () => {
    const store = new MemoryStore(-1)

    await store.increment(key)
    await store.increment(key)
    store.resetKey(key)
    assertCurrentAfterIncrement(await store.increment(key), 1)
  })

  it('resets the key for the store when used with resetAll', async () => {
    const store = new MemoryStore(-1)

    await store.increment(key)
    await store.increment(key)
    store.resetAll()
    assertCurrentAfterIncrement(await store.increment(key), 1)
  })

  it('resets all keys for the store when the timeout is reached', async () => {
    jest.useFakeTimers()
    const store = new MemoryStore(50)
    assertCurrentAfterIncrement(await store.increment(key), 1)
    jest.advanceTimersByTime(100)
    assertCurrentAfterIncrement(await store.increment(key), 1)
  })

  it('decrements the key for the store each decrement', async () => {
    const store = new MemoryStore(-1)

    assertCurrentAfterIncrement(await store.increment(key), 1)
    assertCurrentAfterIncrement(await store.increment(key), 2)
    await store.decrement(key)
    await store.decrement(key)
    assertCurrentAfterIncrement(await store.increment(key), 1)
  })

  it('decrements the key for the store each decrement', async () => {
    const store = new MemoryStore(-1)

    assertCurrentAfterIncrement(await store.increment(key), 1)
    await store.decrement('randomKey')
    assertCurrentAfterIncrement(await store.increment(key), 2)
  })
})

function assertCurrentAfterIncrement(result: { current: number }, expectedValue: number) {
  expect(result.current).toEqual(expectedValue)
}
