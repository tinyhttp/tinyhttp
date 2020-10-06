import { App } from '@tinyhttp/app'
import { rateLimit } from '@tinyhttp/rate-limit'

const app = new App()
const maxNumberOfRequests = 5
const rateLimitResetTimeInSeconds = 10
const port = 3000

const routeRateLimit = rateLimit({
  max: maxNumberOfRequests,
  windowMs: rateLimitResetTimeInSeconds * 1000,
})

app.get('unlimited-route', (_, res) => res.send('Unlimited route'))
app.get('limited-route', routeRateLimit, (_, res) => res.send('Limited route'))

const serverDescription = `
  Server is running on port ${port}.

  http://localhost:3000/unlimited-route is not rate limited.
  http://localhost:3000/limited-route is rate limited and will block requests every further request after ${maxNumberOfRequests} tries for ${rateLimitResetTimeInSeconds} seconds
`

app.listen(port, () => console.log(serverDescription))
