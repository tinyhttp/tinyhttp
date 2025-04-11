import path from 'node:path'
import { App } from '@tinyhttp/app'
import { Eta } from 'eta'

const views = path.join(import.meta.dirname, 'views')
const app = new App()

const eta = new Eta({ views, cache: true })

app.use((_, res) => {
  res.send(eta.render('./index.eta', { name: 'Eta' }))
})

app.listen(3000, () => console.log('Listening on http://localhost:3000'))
