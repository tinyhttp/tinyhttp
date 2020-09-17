import { App } from '@tinyhttp/app'
import graphql from 'graphql'
import expressGraphQL from 'express-graphql'

const app = new App()
const port = parseInt(process.env.PORT) || 3000

const schema = graphql.buildSchema(`
  type Query {
    hello: String
  }
`)

const rootValue = {
  hello: () => 'Hello world!',
}

app.use(
  '/graphql',
  expressGraphQL.graphqlHTTP({
    schema,
    graphiql: { headerEditorEnabled: true },
    rootValue,
  })
)

app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
