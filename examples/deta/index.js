import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import { Deta } from 'deta'
import * as parser from 'milliparsec'

dotenv.config()

const app = new App()

app.use(parser.json())

const PORT = parseInt(process.env.PORT) || 3000

const deta = Deta(process.env.KEY)

const db = deta.Base('todos')

app.get('/todos', async (_, res) => {
  const { value: todos } = await db.fetch().next()
  res.send(todos)
})

app.post('/todos', async (req, res) => {
  const { task, date } = req.body

  if (!task || !date) return res.sendStatus(400)
  await db.insert({ task, date })
  res.send(`New task "${task}" has been added!`)
})

app.put('/todos', async (req, res) => {
  const { key, task, date } = req.body
  if (!task || !date || !key) return res.sendStatus(400)
  await db.update({ key, task, date })
  res.send(`Task ${task} has been updated!`)
})

app.delete('/todos', async (req, res) => {
  const { key, task } = req.body
  await db.delete(key)
  res.send(`Task ${task} has been updated!`)
})

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
