import { App } from '@tinyhttp/app'
import { json } from 'body-parsec'

const app = new App()

app.use(json())

app.post('/', (req, res) => {
  res.send({ msg: req.body.msg })
})

app.listen(3000)
