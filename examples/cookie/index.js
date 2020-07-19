import { App } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'

const app = new App()

app
  .use(cookieParser())
  .get('/', (req, res) => {
    console.log(req.cookies)
    if (req.cookies?.['user'] === 'user' && req.cookies?.['password'] === 'pwd') {
      res.send('<h1>Welcome user!</h1>')
    } else {
      res.send('<h1>Send cookie to show hidden content</h1>')
    }
  })
  .listen(3000, () => console.log(`Started on http://localhost:3000`))
