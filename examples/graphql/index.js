import { App } from '@tinyhttp/app'
import graphql from 'graphql'
import { createHandler } from 'graphql-http/lib/use/http'

const app = new App()
const port = parseInt(process.env.PORT) || 3000

const schema = graphql.buildSchema(`
  type Query {
    hello: String
  }
`)

const rootValue = {
  hello: () => 'Hello world!'
}

const handler = createHandler({ schema, rootValue })

app.use('/graphql', handler)

app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
