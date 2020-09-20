import { App } from '@tinyhttp/app'
import { renderFile as eta } from 'eta'

const app = new App()

app.engine('eta', eta)

app.use((_, res) => void res.render('index.eta', { name: 'Eta' }))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
