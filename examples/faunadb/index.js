import { App } from '@tinyhttp/app'
import * as dotenv from '@tinyhttp/dotenv'
import fauna from 'faunadb'
import { json } from 'milliparsec'

const isEmptyObject = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object

const hasPostProps = (obj) => Object.keys(obj).every((x) => ['name', 'description', 'price', 'quantity'].includes(x))

const q = fauna.query

dotenv.config()

if (!process.env.DB_KEY) {
  throw new Error(`Missing DB_KEY field in .env file`)
}

const client = new fauna.Client({
  secret: process.env.DB_KEY,
})

const app = new App()

app.use(json())

app.get('/products', async (_, res) => {
  const query = await client.query(
    q.Map(
      // iterate each item in result
      q.Paginate(
        // make paginatable
        q.Match(
          // query index
          q.Index('all_products') // specify source
        )
      ),
      (ref) => q.Get(ref) // lookup each result by its reference
    )
  )

  // @ts-ignore
  res.send(query.data)
})

app.get('/product/:name', async (req, res, next) => {
  const name = req.params.name

  if (!name) {
    res.sendStatus(404)
  } else {
    try {
      const query = await client.query(q.Get(q.Match(q.Index('products_by_name'), name)))
      // @ts-ignore
      res.send(query.data)
    } catch (e) {
      console.log(e)
      next(e)
    }
  }
})

app.post('/product', async (req, res, next) => {
  if (!isEmptyObject(req.body) && hasPostProps(req.body)) {
    try {
      const query = await client.query(
        q.Create(q.Collection('products'), {
          data: req.body,
        })
      )

      res.send(query)
    } catch (e) {
      console.log(e)
      next(e)
    }
  }
})

app.listen(3000, () => console.log(`Started on http://localhost:3000`))
