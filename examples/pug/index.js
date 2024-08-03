import { App } from '@tinyhttp/app'
import { renderFile } from 'pug'

const app = new App()

app.engine('pug', (path, _, opts, cb) => renderFile(path, opts, cb))

app.use((_, res) => void res.render('index.pug'))

app.listen(3000, () => console.log('Listening on http://localhost:3000'))
