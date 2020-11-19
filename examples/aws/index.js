/* eslint-disable @typescript-eslint/no-var-requires */

const serverless = require('serverless-http')
const { App } = require('@tinyhttp/app')

const app = new App()

app.use((_, res) => {
  res.send(`Current time: ${new Date().toTimeString()}`)
})

module.exports.handler = serverless(app.handler)
