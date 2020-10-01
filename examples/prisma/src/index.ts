import { App, Request, Response } from '@tinyhttp/app'
import { PrismaClient } from '@prisma/client'
import * as bodyParser from 'body-parser'

const prisma = new PrismaClient()
const app = new App()

app.use(bodyParser.json() as any)
app.post(`/user`, handlePostUser)
app.post(`/post`, handlePostPost)
app.put('/publish/:id', handlePutPublishById)
app.delete(`/post/:id`, handleDeletePostById)
app.get(`/post/:id`, handleGetPostById)
app.get('/feed', handleGetFeed)
app.get('/filterPosts', handleGetFilterPosts)

async function handlePostUser(req: Request, res: Response) {
  const result = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
    },
  })
  res.json(result)
}

async function handlePostPost(req: Request, res: Response) {
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

async function handlePutPublishById(req: Request, res: Response) {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
}

async function handleDeletePostById(req: Request, res: Response) {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
}

async function handleGetPostById(req: Request, res: Response) {
  const { id } = req.params
  const post = await prisma.post.findOne({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
}

async function handleGetFeed(req: Request, res: Response) {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  res.json(posts)
}

async function handleGetFilterPosts(req: Request, res: Response) {
  const { searchString }: { searchString?: string } = req.query
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
