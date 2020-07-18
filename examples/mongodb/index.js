// @ts-nocheck
import { App } from '@tinyhttp/app'
import dotenv from 'dotenv'
import mongodb from 'mongodb'
import assert from 'assert'
import * as parser from 'body-parsec'

dotenv.config()

const app = new App()
let db

// connect to mongodb
const client = new mongodb.MongoClient(process.env.DB_URI, {
  useUnifiedTopology: true,
})
const dbName = 'notes'
client.connect((err) => {
  assert.equal(null, err)
  console.log('successfully connected with mongodb')
  db = client.db(dbName)
})

// get all notes
app.get('/notes', async (_, res, next) => {
  try {
    const r = await db.collection('notes').find({}).toArray()
    res.send(r)
  } catch (err) {
    next(err)
  }
})

// add new note
app.post('/notes', async (req, res, next) => {
  await parser.form()(req, res)
  try {
    const r = await db.collection('notes').insertOne({ title: req.body.title, desc: req.body.desc })
    assert.equal(1, r.insertedCount)
    res.send(`Note with title of "${req.body.title}" has been added`)
  } catch (err) {
    next(err)
  }
})

// delete note
app.delete('/notes', async (req, res, next) => {
  try {
    const r = await db.collection('notes').deleteOne({ _id: new mongodb.ObjectId(req.query.id) })
    assert.equal(1, r.deletedCount)
    res.send(`Note with id of ${req.query.id} has been deleted`)
  } catch (err) {
    next(err)
  }
})

// update existing note
app.put('/notes', async (req, res, next) => {
  try {
    await db
      .collection('notes')
      .findOneAndUpdate({ _id: new mongodb.ObjectId(req.query.id) }, { $set: { title: req.query.title, desc: req.query.desc } }, { returnOriginal: false, upsert: true })
    res.send(`Note with title of ${req.query.title} has been updated`)
  } catch (err) {
    next(err)
  }
})

app.listen(3000, () => console.log('successfully connected on port 3000'))
