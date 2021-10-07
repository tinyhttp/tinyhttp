import { App } from '@tinyhttp/app'
import { urlencoded } from 'milliparsec'
import { Low, JSONFile } from 'lowdb'

const app = new App()
const adapter = new JSONFile('db.json')
const db = new Low(adapter)
await db.read()
const { posts } = db.data

app.use(urlencoded())

// get all posts
app.get('/', (_, res) => {
  res.send(posts)
})

// get post by id
app.get('/:id', (req, res) => {
  const currentPost = posts.find(post => post.id === parseInt(req.params.id))
  if (currentPost) {
    res.send(currentPost)
  } else {
    res.send({ msg: `A post with an id ${req.params.id} is not found` })
  }
})

// add a post
app.post('/', (req, res) => {
  if (req.body.title) {
    posts.push({ id: Date.now(), title: req.body.title, likes: 0 })
    db.write()
    res.send({ msg: `Post with title of "${req.body.title}" is successfully added` })
  } else {
    res.send({ msg: 'Post title missing' })
  }
})

// like a post
app.put('/:id', (req, res) => {
  const currentPost = posts.find(post => post.id === parseInt(req.params.id))
  if (currentPost) {
    currentPost.likes += 1
    db.write()
    res.send({ msg: `You liked a post with a title of ${currentPost.title}` })
  } else {
    res.send({ msg: `A post with an id ${req.params.id} is not found` })
  }
})

// delete a post
app.delete('/:id', (req, res) => {
  const currentPost = posts.filter(post => post.id !== parseInt(req.params.id))
  if (posts.length > currentPost.length) {
    db.data.posts = currentPost
    db.write()
    res.send({ msg: `A post with an id of ${req.params.id} has been deleted` })
  } else {
    res.send({ msg: `A post with an id ${req.params.id} is not found` })
  }
})

app.listen(3000, () => console.log('Server is connected on http://localhost:3000'))
