import { App } from '@tinyhttp/app'
import { json } from 'milliparsec'
import Validator from 'fastest-validator'

const v = new Validator()

const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean' // short-hand def
}

const check = v.compile(schema)

const app = new App()

app
  .use(json())
  .post('/', (req, res) => {
    const result = check(req.body)

    if (result === true) res.send(`Body is valid`)
    else {
      // Send 422 Unprocessable Entity
      res.status(422).json(result)
    }
  })
  .listen(3000)
