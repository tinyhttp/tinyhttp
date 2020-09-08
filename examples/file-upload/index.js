import { App } from '@tinyhttp/app'
import formidable from 'formidable'

const app = new App()

app.post('/api/upload', (req, res, next) => {
  const form = formidable({ multiples: true })

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ fields, files })
  })
})

app.listen(3000, () => console.log('Server listening on http://localhost:3000'))
