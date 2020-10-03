import { botDetector, RequestWithBotDetector } from '../../packages/bot-detector/src'
import { makeFetch } from 'supertest-fetch'
import { Response } from '../../packages/app/src'
import http from 'http'

function createServer() {
  const _detector = botDetector()
  return http.createServer((req: RequestWithBotDetector, res: Response) => {
    _detector(req, res, (err) => {
      if (err) {
        res.statusCode = 500
        res.end(err.message)
        return
      }

      const { isBot, botName } = req
      res.end(JSON.stringify({ isBot, botName }))
    })
  })
}

describe('Bot Detector tests', () => {
  it('should not identify a browser as bot', async () => {
    await makeFetch(createServer())('/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
      },
    }).expect(200, '{"isBot":false}')
  })

  it('should identify google crawler as bot', async () => {
    await makeFetch(createServer())('/', {
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
      },
    }).expect(200, '{"isBot":true,"botName":"Google"}')
  })

  it('should identify a node request as bot', async () => {
    await makeFetch(createServer())('/', {
      headers: {
        'User-Agent': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
      },
    }).expect(200, '{"isBot":true,"botName":"fetch"}')
  })
})
