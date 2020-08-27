import { App } from '../../packages/app/src'
import { logger } from '../../packages/logger/src'
import { cyan, red, magenta, bold } from 'colorette'
import supertest from 'supertest'

describe('Logger tests', () => {
  it('should use the timestamp format specified in the `format` property', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: { format: 'mm:ss' } }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })
  it('should enable timestamp if `timestamp` propery is true', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)
      console.log = originalConsoleLog
      done()
    }

    const app = new App()
    app.use(logger({ timestamp: true }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })

  it('should call a custom output function', (done) => {
    const customOutput = (log: string) => {
      expect(log).toMatch('GET 404 Not Found /')
      done()
    }

    const app = new App()
    app.use(logger({ output: { callback: customOutput, color: false } }))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })

  describe('Color logs', () => {
    const createColorTest = (status, color, done) => {
      return () => {
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

        const request = supertest(server)

        request
          .get('/')
          .expect(status)
          .end(() => {
            server.close()
          })
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
    it('should not output anything if not passing badge config')
    it('should display emoji');
    it('should display caption');
    it('should display both emoji and caption');
    it('should output correct type of emoji based on status code');
  })
})
