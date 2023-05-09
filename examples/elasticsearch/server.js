import { App } from '@tinyhttp/app'
import { isEmptyObject, hasPostProps, PORT, isEmptyString } from './utils.js'
import { search, insert, bulkInsert } from './client.js'
import { json as json_parser } from 'milliparsec'

const app = new App().use('/', json_parser())

app.get('/search/:index', async (req, res) => {
  const index = req.params.index
  const query = req.query.query
  const value = req.query.value
  if (!isEmptyString(index) && !isEmptyObject(query) && !isEmptyString(value)) {
    const result = await search(index, query, value)
    return res.status(200).send(result)
  }
})

app.post('/insert/bulk/:index', async (req, res) => {
  const index = req.params.index
  const dataToBeInserted = []
  if (req.body && Array.isArray(req.body.data)) {
    for (const data of req.body.data) {
      if (!isEmptyObject(data) && hasPostProps(data)) {
        dataToBeInserted.push(data)
      }
    }
  }
  if (dataToBeInserted.length) {
    const result = await bulkInsert(index, dataToBeInserted)
    return res.status(201).send(result)
  }
})

app.post('/insert/:index', async (req, res) => {
  const index = req.params.index
  let document = {}
  if (!isEmptyObject(req.body) && hasPostProps(req.body)) {
    document = req.body
    const result = await insert(index, document)
    return res.status(201).send(result)
  }
})

app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`))
