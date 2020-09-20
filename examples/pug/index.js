import { App } from '@tinyhttp/app'
import { pug } from '@tinyhttp/pug'

const app = pug()(new App())

app.use((_, res) => void res.render('index.pug'))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
