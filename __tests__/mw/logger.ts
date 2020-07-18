import { App } from "../../packages/app/src";
import logger from "../../packages/logger/src";
import supertest from "supertest";


describe('Logger tests', () => {
  it('should use the logger middleware and log a GET request', (done) => {
    const originalConsoleLog = console.log;

    console.log = (log) => {
      expect(log.split(' ')[2]).toBe('GET');
      console.log = originalConsoleLog;
      done();
    }

    const app = new App()
    app.use(logger({ timestamp: { format: 'HH:mm:ss' } }))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/')
      .expect(404)
      .end(() => {
        server.close()
      })
  })
}) 