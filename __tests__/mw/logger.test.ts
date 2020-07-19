import { App } from '../../packages/app/src'
import { logger } from '../../packages/logger/src'
import supertest from 'supertest'


describe('Logger tests', () => {
  it('should use the timestamp format specified in the `format` property', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}\:[0-9]{2}/)
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
  it('should enable timestamp if it is true', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[0]).toMatch(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/)
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
})
