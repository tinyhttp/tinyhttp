import { App } from '@tinyhttp/app'
import { jwt } from '@tinyhttp/jwt'
import { urlencoded } from 'milliparsec'
import jsonwebtoken from 'jsonwebtoken'

const app = new App()
const secretToken = 'very secret key'

app.use(jwt({ secret: secretToken, algorithm: 'HS256' }))
app.use(urlencoded())

app.get('/', (_req, res) => {
  res.send('Go to "/login" page to login')
})

app.post('/login', (req, res) => {
  const { body } = req

  if (body.user !== 'admin' || body.pwd !== 'admin') {
    res.send('Incorrect login')
    return
  }

  res
    .set('X-Token', jsonwebtoken.sign({ cool: true }, secretToken, { algorithm: 'HS256' }))
    .status(204)
    .end()
})

app.listen(3000)
