import { App } from '@tinyhttp/app'
import Prisma from '@prisma/client'
import bodyParser from 'body-parser'

const prisma = new Prisma.PrismaClient()
const app = new App()

app.use(bodyParser.json())
app.post(`/user`, handlePostUser)
app.post(`/post`, handlePostPost)
app.put('/publish/:id', handlePutPublishById)
app.delete(`/post/:id`, handleDeletePostById)
app.get(`/post/:id`, handleGetPostById)
app.get('/feed', handleGetFeed)
app.get('/filterPosts', handleGetFilterPosts)

async function handlePostUser(req, res) {
  const result = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
    },
  })
  res.json(result)
}

async function handlePostPost(req, res) {
  const { title, content, authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(result)
}

async function handlePutPublishById(req, res) {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
}

async function handleDeletePostById(req, res) {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
}

async function handleGetPostById(req, res) {
  const { id } = req.params
  const post = await prisma.post.findOne({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
}

async function handleGetFeed(req, res) {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  res.json(posts)
}

async function handleGetFilterPosts(req, res) {
  const { searchString } = req.query
  const draftPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        {
          content: {
            contains: searchString,
          },
        },
      ],
    },
  })
  res.json(draftPosts)
}

app.listen(3000, () => console.log('Server ready at: http://localhost:3000'))
