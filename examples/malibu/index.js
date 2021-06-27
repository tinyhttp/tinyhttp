import { App } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { csrf } from 'malibu'
import { json } from 'milliparsec'

const app = new App()

// Anything with minimum length of 32 bit (or 32 characters) is recommended.
// Put this on your .env file
const cookieSecret = 'fvTzvQBQ9zUEUfvZaqjPx8yi4JqrZV85'
app.use(cookieParser(cookieSecret))

const csrfProtection = csrf({ cookie: { signed: true } })

app.get('/', csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() })
})

app.post('/', json(), csrfProtection, (_, res) => {
  res.status(200).json({ message: 'hello there' })
})

app.listen(3000, () => console.log('listening on http://localhost:3000'))
