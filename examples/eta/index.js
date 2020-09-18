/* eslint-disable @typescript-eslint/no-var-requires */
const { App } = require('@tinyhttp/app')
const eta = require('eta')

const app = new App()

app.engine('eta', eta.renderFile)

app.use((_, res) => void res.render('index.eta', { name: 'Eta' }))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
