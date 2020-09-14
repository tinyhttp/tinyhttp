import { App } from '@tinyhttp/app'
import ejs from 'ejs'

const app = new App()

app.engine('ejs', ejs.renderFile)

app.use((_, res) => void res.render('index.ejs', { name: 'EJS' }))

app.listen(3000, () => console.log(`Listening on http://localhost:3000`))
