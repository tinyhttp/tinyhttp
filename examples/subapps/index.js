import { App } from '@tinyhttp/app'

const app = new App()

const subApp = new App()

subApp.get('/route', (_, res) => res.send(`Hello from ${subApp.mountpath}`))

app.use('/subapp', subApp)

app.listen(3000)
