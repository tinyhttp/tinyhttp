import { App, type Request, type Response } from '@tinyhttp/app'
import * as functions from 'firebase-functions'

const tinyhttp = new App()

/** Your application code */
tinyhttp.get('/api', (req, res) => {
  res.send({ ok: true, q: req.query })
})
tinyhttp.post('/api', (req, res) => {
  res.send({ ok: true, b: req.query })
})
tinyhttp.use('/', (_, res) => {
  res.send('<h1>Hello World</h1>')
})

/** Make firebase function handler compatible with tinyhttp */
const onRequest = functions.https.onRequest as unknown as (
  handler: (req: Request, res: Response) => void | Promise<void>
) => functions.HttpsFunction
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
export const app = onRequest((request, response) => {
  makeReadonlySettable(request)
  tinyhttp.handler(request, response)
})

/** Hack for firebase functions request object, it was read only */
function makeReadonlySettable(req: Request) {
  // biome-ignore lint/complexity/noForEach: <explanation>
  return ['xhr', 'node:path'].forEach((key) => {
    Object.defineProperty(req, key, {
      get: function () {
        return this[`_${key}`]
      },
      set: function (val) {
        this[`_${key}`] = val
      }
    })
  })
}
