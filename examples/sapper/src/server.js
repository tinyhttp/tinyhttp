import { App } from '@tinyhttp/app'
import * as sapper from '@sapper/server'

const PORT = process.env.PORT

const app = new App()

app.use(sapper.middleware())

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
