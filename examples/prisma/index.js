import { App } from '@tinyhttp/app'
import Prisma from '@prisma/client'
import * as bodyParser from 'milliparsec'

const prisma = new Prisma.PrismaClient()
const app = new App()

app.use(bodyParser.json())

app.post('/user', async (req, res) => {
  res.json(
    await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name
      }
    })
  )
})
app.post('/post', async (req, res) => {
  const { title, content, authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } }
    }
  })
  res.json(result)
})
app.put('/publish/:id', async (req, res) => {
  res.json(
    await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { published: true }
    })
  )
})
app.delete('/post/:id', async (req, res) => {
  res.json(
    await prisma.post.delete({
      where: {
        id: Number(req.params.id)
      }
    })
  )
})
app.get('/post/:id', async (req, res) => {
  res.json(
    await prisma.post.findOne({
      where: {
        id: Number(req.params)
      }
    })
  )
})
app.get('/feed', async (_, res) => {
  res.json(
    await prisma.post.findMany({
      where: { published: true },
      include: { author: true }
    })
  )
})
app.get('/filterPosts', async (req, res) => {
  const { searchString } = req.query

  res.json(
    await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchString
            }
          },
          {
            content: {
              contains: searchString
            }
          }
        ]
      }
    })
  )
})

app.listen(3000, () => console.log('Server ready at: http://localhost:3000'))
