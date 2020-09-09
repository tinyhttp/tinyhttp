import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import bodyParser from 'body-parser'
import Nano from 'nano'

const app = new App()

// set up the env variables
dotenv.config()
const USER = process.env.USER
const PASS = process.env.PASS
const PORT = parseInt(process.env.PORT) || 3000

// if node_env is not in production then use local databse
const COUCHDB_URI = process.env.NODE_ENV !== 'production' ? `http://${USER}:${PASS}@localhost:5984` : process.env.COUCHDB_URI

// coonect local database
const nano = Nano(COUCHDB_URI)
const todoDB = nano.db.use('todos')

// parse
app.use('/todos', bodyParser.urlencoded({ extended: false }))
app.use('/todos', bodyParser.json())

// get all tasks
app.get('/todos', async (_, res, next) => {
  try {
    const { rows } = await todoDB.list({ include_docs: true })
    res.send(rows)
    next()
  } catch (e) {
    next(e)
  }
})

// add a new task
app.post('/todos', async (req, res, next) => {
  try {
    const { task, date } = req.body
    await todoDB.insert({ task, date })
    res.send(`New task "${task}" has been added!`)
  } catch (e) {
    next(e)
  }
})

// update an existing task
app.put('/todos', async (req, res, next) => {
  try {
    const { _id, _rev, task, date } = req.body
    await todoDB.insert({ _id, _rev, task, date })
    res.send(`Task ${task} has been updated!`)
  } catch (e) {
    next(e)
  }
})

// delete a existing task
app.delete('/todos', async (req, res, next) => {
  try {
    const { _id, _rev, task } = req.body
    await todoDB.destroy(_id, _rev)
    res.send(`Task "${task} has been removed!"`)
  } catch (e) {
    next(e)
  }
})

app.listen(PORT, () => console.log(`server is live at ${PORT}`))
