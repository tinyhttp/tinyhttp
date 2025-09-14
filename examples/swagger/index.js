import { App } from '@tinyhttp/app'
import { addToDocs, serveDocs } from '@tinyhttp/swagger'

// In case the value for a given field is an object, @tinyhttp/swagger only uses the type, optional or items (in case type is array)
// Other fields are ignored and are shown here only to imply that the same schema object can be used for validation by the fastest-validator package
const schema = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean'
}

const app = new App()

app
  .get('/docs/:docId', addToDocs({ params: { docId: 'number' } }), (_req, res) => {
    res.status(200).send('done')
  })
  .post(
    '/docs/:docId',
    addToDocs(
      {
        headers: { authorization: 'string' },
        params: { docId: 'number' },
        body: schema
      },
      ['docs']
    ),
    (_req, res) => void res.status(200).send('done')
  )
  .get('/users', addToDocs({ query: { userId: { type: 'number', optional: true } } }, ['users']), (_req, res) => {
    res.status(200).send('done')
  })
  .get('/:userId/:docId', addToDocs({ params: { userId: 'number', docId: 'number' } }), (_req, res) => {
    res.status(200).send('done')
  })

// Only title is required. if servers and description are not provided, nothing is shown. version and prefix have default values of 0.1 and docs.
serveDocs(app, {
  title: 'example',
  version: '1.0',
  prefix: 'api-docs',
  description: 'this is an example for @tinyhttp/swagger',
  servers: ['www.host1.com/api/v1', 'api.host2.org/v1']
})
app.listen(3000)
