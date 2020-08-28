import { App } from '../../packages/app/src'
import { logger } from '../../packages/logger/src'
import { cyan, red, magenta, bold } from 'colorette'
import supertest from 'supertest'

describe('Logger tests', () => {
  it('should use the timestamp format specified in the `format` property', (done) => {
    const originalConsoleLog = console.log

    console.log = (log: string) => {
      expect(log.split(' ')[2]).toMatch(/[0-9]{2}:[0-9]{2}/)
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
      expect(log.split(' ')[2]).toMatch(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)
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
            expect(log.split(' ')[3]).toMatch(cyan(bold(status).toString()))
          } else if (color === 'red') {
            expect(log.split(' ')[3]).toMatch(red(bold(status).toString()))
          } else if (color === 'magenta') {
            expect(log.split(' ')[3]).toMatch(magenta(bold(status).toString()))
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
    it('should display emoji', (done) => {
      const app = new App();

      const customOutput = (log: string) => {
        expect(log).toMatch(/🆗/);
        done();
      };

      app.use(logger({
        badges: { emoji: true, captions: false },
        output: { callback: customOutput, color: false },
      }));

      app.get('/', (_, res) => res.status(200).send(''));

      const server = app.listen();

      const request = supertest(server);

      request.get('/')
        .expect(200)
        .end(() => {
          server.close();
        });

    });
    it('should display caption', (done) => {
      const app = new App();

      const customOutput = (log: string) => {
        expect(log.split(' ')[1]).toMatch(/ok/)
        done();
      };

      app.use(logger({
        badges: { emoji: false, captions: true },
        output: { callback: customOutput, color: false },
      }));

      app.get('/', (_, res) => res.status(200).send(''));

      const server = app.listen();

      const request = supertest(server);

      request.get('/')
        .expect(200)
        .end(() => {
          server.close();
      });

    });
    it('should not output anything if not passing badge config', (done) => {
      const app = new App();
      const customOutput = (log: string) => {
        expect(log).toMatch('GET 200 OK /');
        done();
      }

      app.use(logger({ output: { callback: customOutput, color: false } }));

      app.get('/', (_, res) => res.status(200).send(''));

      const server = app.listen();

      const request = supertest(server);

      request.get('/')
        .expect(200)
        .end(() => {
          server.close();
        })
    })
    it('should display both emoji and caption', (done) => {
      const app = new App();
      const customOutput = (log: string) => {
        expect(log).toMatch('🆗 ok GET 200 OK /');
        done();
      }

      app.use(logger({
        badges: { emoji: true, captions: true },
        output: { callback: customOutput, color: false },
      }));

      app.get('/', (_, res) => res.status(200).send(''));

      const server = app.listen();

      const request = supertest(server);

      request.get('/')
        .expect(200)
        .end(() => {
          server.close();
        })
    });
    const createEmojiTest = (status: number, expected: string, done: () => void) => {
      const app = new App();
      const customOutput = (log: string) => {
        expect(log.split(' ').slice(0, 2).join(' ')).toMatch(expected);
        done();
      }

      app.use(logger({
        badges: { emoji: true, captions: true },
        output: { callback: customOutput, color: false },
      }));

      app.get('/', (_, res) => res.status(status).send(''));

      const server = app.listen();

      const request = supertest(server);

      request.get('/')
        .expect(status)
        .end(() => {
          server.close();
        })
    }
    it('should output correct 2XX log', (done) => {
      createEmojiTest(200, '🆗 ok', done);
    });
    it('should output correct 4XX log', (done) => {
      createEmojiTest(400, '⚠️ warning', done);
    });
    it('should output correct 404 log', (done) => {
      createEmojiTest(404, '🔎 mag_right', done);
    });
    it('should output correct 5XX log', (done) => {
      createEmojiTest(500, '❌ x', done);
    });
  })
})


