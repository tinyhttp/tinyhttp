import { App } from '../../packages/app/src'
import { logger } from '../../packages/logger/src'
import { cyan, red, magenta, bold } from 'colorette'
import { makeFetch } from 'supertest-fetch'

describe('Logger tests', () => {
  it('should use the timestamp format specified in the `format` property', async (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: { format: 'mm:ss' } }))

    const server = app.listen()

    await makeFetch(server)('/').expect(404)
  })
  it('should enable timestamp if `timestamp` propery is true', async (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: true }))

    const server = app.listen()

    await makeFetch(server)('/').expect(404)
  })

  it('should call a custom output function', async (done) => {
    const customOutput = (log: string) => {
      expect(log).toMatch('GET 404 Not Found /')
      done()
    }

    const app = new App()
    app.use(logger({ output: { callback: customOutput, color: false } }))

    const server = app.listen()

    await makeFetch(server)('/').expect(404)
  })

  describe('Color logs', () => {
    const createColorTest = (status, color, done) => {
      return async () => {
        const customOutput = (log: string) => {
          if (color === 'cyan') {
            expect(log.split(' ')[1]).toMatch(cyan(bold(status).toString()))
          } else if (color === 'red') {
            expect(log.split(' ')[1]).toMatch(red(bold(status).toString()))
          } else if (color === 'magenta') {
            expect(log.split(' ')[1]).toMatch(magenta(bold(status).toString()))
          }
          done()
        }

        const app = new App()

        app.use(logger({ output: { callback: customOutput, color: true } }))
        app.get('/', (_, res) => res.status(status).send(''))

        const server = app.listen()

        await makeFetch(server)('/').expect(status)
      }
    }

    it('should color 2xx cyan', (done) => {
      createColorTest(200, 'cyan', done)()
    })

    it('should color 4xx red', (done) => {
      createColorTest(400, 'red', done)()
    })

    it('should color 5xx magenta', (done) => {
      createColorTest(500, 'magenta', done)()
    })
  })
  describe('Badge Log', () => {
    it('should display emoji', async (done) => {
      const app = new App()

      const customOutput = (log: string) => {
        expect(log).toMatch(/✅/)
        done()
      }

      app.use(
        logger({
          emoji: true,
          output: { callback: customOutput, color: false },
        })
      )

      app.get('/', (_, res) => res.status(200).send(''))

      const server = app.listen()

      await makeFetch(server)('/').expect(200)
    })
    it('should not output anything if not passing badge config', async (done) => {
      const app = new App()
      const customOutput = (log: string) => {
        expect(log).toMatch('GET 200 OK /')
        done()
      }

      app.use(logger({ output: { callback: customOutput, color: false } }))

      app.get('/', (_, res) => res.status(200).send(''))

      const server = app.listen()

      await makeFetch(server)('/').expect(200)
    })
    it('should display both emoji and caption', async (done) => {
      const app = new App()
      const customOutput = (log: string) => {
        expect(log).toMatch('✅ GET 200 OK /')
        done()
      }

      app.use(
        logger({
          emoji: true,
          output: { callback: customOutput, color: false },
        })
      )

      app.get('/', (_, res) => res.status(200).send(''))

      const server = app.listen()

      await makeFetch(server)('/').expect(200)
    })
    const createEmojiTest = async (status: number, expected: string, done: () => void) => {
      const app = new App()
      const customOutput = (log: string) => {
        expect(log.split(' ')[0]).toMatch(expected)
        done()
      }

      app.use(
        logger({
          emoji: true,
          output: { callback: customOutput, color: false },
        })
      )

      app.get('/', (_, res) => res.status(status).send(''))

      const server = app.listen()

      await makeFetch(server)('/').expect(status)
    }
    it('should output correct 2XX log', (done) => {
      createEmojiTest(200, '✅', done)
    })
    it('should output correct 4XX log', (done) => {
      createEmojiTest(400, '🚫', done)
    })
    it('should output correct 404 log', (done) => {
      createEmojiTest(404, '❓', done)
    })
    it('should output correct 5XX log', (done) => {
      createEmojiTest(500, '💣', done)
    })
  })
})
