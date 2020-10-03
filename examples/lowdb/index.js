import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync.js'
import { App } from '@tinyhttp/app'
import { urlencoded } from 'milliparsec'

const app = new App()
const adapter = new FileSync('db.json')
const db = low(adapter)

// get all posts

app.use(urlencoded())

app.get('/', (_, res) => {
  res.send(db.getState().posts)
})

// get post by id
app.get('/:id', (req, res) => {
  res.send(
    db
      .get('posts')
      // @ts-ignore
      .find({ id: parseInt(req.params.id) })
      .value()
  )
})

// add a post
app.post('/', (req, res) => {
  if (req.body.title) {
    // @ts-ignore
    db.get('posts').push({ id: Date.now(), title: req.body.title, likes: 0 }).write()
    res.send({ msg: `Post with title of "${req.body.title}" is successfully added` })
  } else {
    res.send('Post title missing')
  }
})

// like a post
app.put('/:id', (req, res) => {
  const currentPost = db
    .get('posts')

    // @ts-ignore
    .find({ id: parseInt(req.params.id) })
    .value()
  currentPost.likes += 1
  db.write()
  res.send({ msg: `You liked a post with a title of ${currentPost.title}` })
})

// delete a post
app.delete('/:id', (req, res) => {
  db.get('posts')

    //@ts-ignore
    .remove({ id: parseInt(req.params.id) })
    .write()
  res.send({ msg: `A post with an id of ${req.params.id} has been deleted` })
})

app.listen(3000, () => console.log('Server is connected on http://localhost:3000'))
