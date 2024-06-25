import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import * as bodyParser from 'milliparsec'
import Nano from 'nano'

const app = new App()

// set up the env variables
dotenv.config()
const USER = process.env.USER
const PASS = process.env.PASS
const PORT = Number.parseInt(process.env.PORT) || 3000

// if node_env is not in production then use local databse
const COUCHDB_URI =
  process.env.NODE_ENV !== 'production' ? `http://${USER}:${PASS}@localhost:5984` : process.env.COUCHDB_URI

// coonect local database
const nano = Nano(COUCHDB_URI)
const todoDB = nano.db.use('todos')

// parse
app.use('/todos', bodyParser.urlencoded())
app.use('/todos', bodyParser.json())

// get all tasks
app.get('/todos', async (_, res) => {
  const { rows } = await todoDB.list({ include_docs: true })
  res.send(rows)
})

// add a new task
app.post('/todos', async (req, res) => {
  const { task, date } = req.body
  await todoDB.insert({ task, date })
  res.send(`New task "${task}" has been added!`)
})

// update an existing task
app.put('/todos', async (req, res) => {
  const { _id, _rev, task, date } = req.body
  await todoDB.insert({ _id, _rev, task, date })
  res.send(`Task ${task} has been updated!`)
})

// delete a existing task
app.delete('/todos', async (req, res) => {
  const { _id, _rev, task } = req.body
  await todoDB.destroy(_id, _rev)
  res.send(`Task "${task} has been removed!"`)
})

app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`))
