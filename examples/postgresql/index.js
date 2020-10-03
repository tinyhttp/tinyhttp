import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import pg from 'pg-promise'
import { urlencoded as parser } from 'milliparsec'

import sql from './sql/index.js'

dotenv.config()

const app = new App()
const port = parseInt(process.env.PORT) || 3000
const connection = process.env.DB_CONNECTION

if (!connection) {
  throw new Error('DB_CONNECTION must be provided')
}

const initOptions = {
  /* initialization options */
}
const pgp = pg(initOptions)
const db = pgp(connection)

const init = async () => {
  db.none(sql.users.create)
    .then(() => db.many(sql.users.init))
    .catch((error) => {
      console.error(`failed to initialize db: ${error}`)
    })
}

init()

// get all users
app.get('/users', async (_, res, next) => {
  try {
    const result = await db.manyOrNone(sql.users.list)
    res.send(result)
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/users', parser())

// get a user by id
app.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await db.oneOrNone(sql.users.get, id)
    res.send({ data: result })
    next()
  } catch (err) {
    next(err)
  }
})

// add new user
app.post('/users', async (req, res, next) => {
  try {
    const { name } = req.body
    const result = await db.one(sql.users.add, name)
    res.send({ message: `User with name "${result.name}" has been added`, data: result })
  } catch (err) {
    next(err)
  }
})

// delete user
app.delete('/users', async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await db.one(sql.users.delete, id)
    res.send({ message: `User with id of ${result.id} has been deleted`, data: result })
  } catch (err) {
    next(err)
  }
})

// update existing user
app.put('/users', async (req, res, next) => {
  try {
    const { name, id } = req.body
    await db.none(sql.users.update, [name, id])
    res.send({ message: `User with id of ${id} has been updated with name ${name}` })
  } catch (err) {
    next(err)
  }
})

app.listen(port, () => console.log(`Started on http://localhost:${port}`))
