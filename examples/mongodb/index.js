import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import { urlencoded as parser } from 'milliparsec'
import mongodb from 'mongodb'
import assert from 'assert'

dotenv.config()

const app = new App()
const port = parseInt(process.env.PORT) || 3000
let db
let coll

// connect to mongodb
const client = new mongodb.MongoClient(process.env.DB_URI, {
  useUnifiedTopology: true,
})

client.connect(async (err) => {
  assert.notStrictEqual(null, err)
  console.log('successfully connected to MongoDB')
  db = client.db('notes')
  coll = db.collection('notes')
})

// get all notes
app.get('/notes', async (_, res, next) => {
  try {
    const r = await coll.find({}).toArray()
    res.send(r)
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/notes', parser())

// add new note
app.post('/notes', async (req, res, next) => {
  try {
    const { title, desc } = req.body
    const r = await coll.insertOne({ title, desc })
    assert.strictEqual(1, r.insertedCount)
    res.send(`Note with title of "${title}" has been added`)
  } catch (err) {
    next(err)
  }
})

// delete note
app.delete('/notes', async (req, res, next) => {
  try {
    const { id } = req.body
    const r = await coll.deleteOne({ _id: new mongodb.ObjectId(id) })
    assert.strictEqual(1, r.deletedCount)
    res.send(`Note with id of ${id} has been deleted`)
  } catch (err) {
    next(err)
  }
})

// update existing note
app.put('/notes', async (req, res, next) => {
  try {
    const { title, desc, id } = req.body
    await coll.findOneAndUpdate({ _id: new mongodb.ObjectId(id) }, { $set: { title, desc } }, { returnOriginal: false, upsert: true })
    res.send(`Note with title of ${title} has been updated`)
  } catch (err) {
    next(err)
  }
})

app.listen(port, () => console.log(`Started on http://localhost:${port}`))
