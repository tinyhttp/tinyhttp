import * as functions from 'firebase-functions'
import { App } from '@tinyhttp/app'
const tinyhttp = new App()

/** Your application code */
tinyhttp.use('/', (_, res) => {
  res.send('<h1>Hello World</h1>')
})

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
export const app = functions.https.onRequest((request, response) => {
  makeReadonlySettable(request)
  // @ts-ignore
  tinyhttp.handler(request, response).catch(() => response.send('sad'))
})

/** Hack for firebase functions request object, it was read only */
function makeReadonlySettable(req: functions.https.Request) {
  return ['xhr', 'path'].forEach((key) => {
    Object.defineProperty(req, key, {
      get: function () {
        return this[`_${key}`]
      },
      set: function (val) {
        this[`_${key}`] = val
      },
    })
  })
}
