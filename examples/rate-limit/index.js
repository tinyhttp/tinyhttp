import { App } from '@tinyhttp/app'
import { rateLimit } from '@tinyhttp/rate-limit'

const app = new App()

app.use(rateLimit())

app.get('test', (req, res) => {
  res.send('Hello')
})

app.listen(3000, () => console.log('Server ready at: http://localhost:3000'))
