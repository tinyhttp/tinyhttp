import Prisma from '@prisma/client'
import { App } from '@tinyhttp/app'
import graphql from 'graphql'
import { createHandler } from 'graphql-http/lib/use/http'

const prisma = new Prisma.PrismaClient()
const app = new App()

const schema = graphql.buildSchema(`

type Post {
    id: ID!
    authorId: ID!
    author: User
    content: String
    published: Boolean!
    title: String!
  }

  type User {
    id: ID!
    email: String!
    name: String
    post: [Post]!
  }

  type Query {
    post(id: ID!): Post
    feed: [Post]!
    filterPosts(query: String): [Post]!
  }

  type Mutation {
    addUser(email: String!, name: String!): User
    addPost(authorEmail: String!, title: String!, content: String): Post
    publishPost(id: ID!): Post
    deletePost(id: ID!): Post
  }
`)

const rootValue = {
  post: handleGetPostById,
  feed: handleGetFeed,
  filterPosts: handleGetFilterPosts,
  addUser: handleAddUser,
  addPost: handleAddPost,
  publishPost: handlePublishPostById,
  deletePost: handleDeletePostById
}

app.use(
  '/graphql',
  createHandler({
    schema,
    graphiql: { headerEditorEnabled: true },
    rootValue
  })
)

async function handleAddUser(params) {
  const { email, name } = params
  const result = await prisma.user.create({
    data: {
      email,
      name
    }
  })
  return result
}

async function handleAddPost(params) {
  const { title, content, authorEmail } = params
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } }
    }
  })
  return result
}

async function handlePublishPostById(params) {
  const { id } = params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true }
  })
  return post
}

async function handleDeletePostById(params) {
  const { id } = params
  const post = await prisma.post.delete({
    where: {
      id: Number(id)
    }
  })
  return post
}

async function handleGetPostById(params) {
  const { id } = params
  const post = await prisma.post.findOne({
    where: {
      id: Number(id)
    }
  })
  return post
}

async function handleGetFeed() {
  const posts = await prisma.post.findMany({
    where: {
      published: true
    },
    include: { author: true }
  })
  return posts
}

async function handleGetFilterPosts(params) {
  const { query = '' } = params
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query
          }
        },
        {
          content: {
            contains: query
          }
        }
      ]
    },
    include: { author: true }
  })
  return posts
}

app.listen(3000, () => console.log('Server ready at: http://localhost:3000'))
