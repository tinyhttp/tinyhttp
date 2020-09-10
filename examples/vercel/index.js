/* eslint-disable @typescript-eslint/no-var-requires */
const { App } = require('@tinyhttp/app')

const app = new App()

const html = `
<style>
body {
  margin: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
<h1>Hello from Serverless!</h1>
<p>This is a <a href="https://github.com/talentlessguy/tinyhttp">tinyhttp</a> serverless app deployed on <a href="https://vercel.com">Vercel</a>.</p>
`

app.use((_, res) => {
  res.send(html)
})

module.exports = (req, res) => {
  app.handler(req, res)
}
