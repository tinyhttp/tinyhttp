// @ts-nocheck
import { App } from '@tinyhttp/app'
import dotenv from 'dotenv'
import { once } from 'events'
import * as qs from 'querystring'
import mongodb from 'mongodb'
import assert from 'assert'

dotenv.config()

const parser = async (req, _res, next) => {
  req.body = await once(req, 'data').then((r) => qs.parse(r.toString()))
  next()
}

const app = new App()
let db
let coll

// connect to mongodb
const client = new mongodb.MongoClient(process.env.DB_URI, {
  useUnifiedTopology: true,
})
const dbName = 'notes'
client.connect(async (err) => {
  assert.equal(null, err)
  console.log('successfully connected with mongodb')
  db = client.db(dbName)
  coll = await db.collection('notes')
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

app.use(parser)
// add new note
app.post('/notes', async (req, res, next) => {
  try {
    const r = await coll.insertOne({ title: req.body.title, desc: req.body.desc })
    assert.equal(1, r.insertedCount)
    res.send(`Note with title of "${req.body.title}" has been added`)
  } catch (err) {
    next(err)
  }
})

// delete note
app.delete('/notes', async (req, res, next) => {
  try {
    const r = await coll.deleteOne({ _id: new mongodb.ObjectId(req.body.id) })
    assert.equal(1, r.deletedCount)
    res.send(`Note with id of ${req.body.id} has been deleted`)
  } catch (err) {
    next(err)
  }
})

// update existing note
app.put('/notes', async (req, res, next) => {
  try {
    await coll.findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { title: req.body.title, desc: req.body.desc } }, { returnOriginal: false, upsert: true })
    res.send(`Note with title of ${req.body.title} has been updated`)
  } catch (err) {
    next(err)
  }
})

app.listen(3000, () => console.log('successfully connected on port 3000'))
