import { App } from '@tinyhttp/app'
import { urlencoded } from 'milliparsec'
import { SessionManager, MemoryStore } from '@tinyhttp/session'

const app = new App()
const store = new MemoryStore()

app.use(urlencoded())

const getSession = SessionManager({
  store,
  secret: 'super secret text',
})

app.get('/', (_req, res) => {
  res.send('Go to "/login" page to login')
})

app.post('/login', async (req, res) => {
  const { body } = req
  const session = await getSession(req, res)

  console.log(`Received body: ${JSON.stringify(req.body)}`)

  if (body.user !== 'admin' || body.pwd !== 'admin') {
    res.send('Incorrect login')
    return
  }

  session.isLoggedIn = true
  session.user = 'admin'

  res.status(204).end()
})

app.get('/admin', async (req, res) => {
  const session = await getSession(req, res)

  if (!session.isLoggedIn) {
    res.status(403).send('Authorized personnel only!')
    return
  }

  return res.send(`Welcome ${session.user}`)
})

app.listen(3000)
