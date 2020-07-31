const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { App } = require('@tinyhttp/app')

const app = new App()
const adapter = new FileSync('db.json')
const db = low(adapter)

// get all posts
app.get('/', (req, res) => {
  res.send(db.get('posts'))
})

// get post by id
app.get('/:id', (req, res) => {
  res.send(
    db
      .get('posts')
      .find({ id: parseInt(req.params.id) })
      .value()
  )
})

// add a post
app.post('/', (req, res) => {
  db.get('posts').push({ id: Date.now(), title: req.query.title, likes: 0 }).write()
  res.send({ msg: `Post with title of "${req.query.title}" is successfully added` })
})

// like a post
app.put('/:id', (req, res) => {
  const currentPost = db
    .get('posts')
    .find({ id: parseInt(req.params.id) })
    .value()
  currentPost.likes += 1
  db.write()
  res.send({ msg: `You liked a post with a title of ${currentPost.title}` })
})

// delete a post
app.delete('/:id', (req, res) => {
  db.get('posts')
    .remove({ id: parseInt(req.params.id) })
    .write()
  res.send({ msg: `A post with an id of ${req.params.id} has been deleted` })
})

app.listen(3000, () => console.log('Server is connected on http://localhost:3000'))
