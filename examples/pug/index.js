import { App } from '@tinyhttp/app'
import pug from 'pug'

const app = new App()

const renderPug = (path, _, options, cb) => pug.renderFile(path, options, cb)

app.engine('pug', renderPug)

app.use((_, res) => void res.render('index.pug'))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
