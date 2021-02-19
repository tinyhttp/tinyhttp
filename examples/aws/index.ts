import serverless from 'serverless-http'
import { App } from '@tinyhttp/app'

const app = new App()

app.use((_, res) => {
  res.send(`Current time: ${new Date().toTimeString()}`)
})

module.exports.handler = serverless(app.handler.bind(app))
