import { App } from '@tinyhttp/app'
import { urlencoded } from 'milliparsec'
import session from 'next-session/dist/connect.js'
import MemoryStore from 'next-session/dist/store/memory.js'

const modDefault = (x) => x.default

const app = new App()
const store = new (modDefault(MemoryStore))()

app.use(urlencoded())

const sessionWare = modDefault(session)({
  store,
  secret: 'super secret text'
})

app.use(sessionWare)

app.get('/', (_req, res) => {
  res.send('Go to "/login" page to login')
})

app.post('/login', async (req, res) => {
  const { body } = req

  console.log(`Received body: ${JSON.stringify(req.body)}`)

  if (body.user !== 'admin' || body.pwd !== 'admin') {
    res.send('Incorrect login')
    return
  }

  req.session.isLoggedIn = true
  req.session.user = 'admin'

  res.status(204).end()
})

app.get('/admin', async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(403).send('Authorized personnel only!')
    return
  }

  return res.send(`Welcome ${req.session.user}`)
})

app.listen(3000)
