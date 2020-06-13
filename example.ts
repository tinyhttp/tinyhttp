import App from './src/index'
import logger from './src/helpers/logger'
import staticFolder from './src/helpers/static'

const app = new App()

app.get('/', (_, res) => void res.end('hello'))

app.post('/', (_, res) => void res.end('hi'))

app.use(logger())

app.listen(3000)
