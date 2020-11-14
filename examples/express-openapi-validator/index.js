import { App } from '@tinyhttp/app'

import { bodyParser } from 'body-parser'
import OpenApiValidator from 'express-openapi-validator'

import path from 'path'
import http from 'http'

const app = new App()
app.use(bodyParser.json())
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(
  OpenApiValidator.middleware({
    apiSpec: './api.yaml',
    validateResponses: true,
  })
)

// 5. Define routes using tinyhttp
app.get('/v1/pets', (_, res) => {
  res.json([
    { id: 1, type: 'cat', name: 'max' },
    { id: 2, type: 'cat', name: 'mini' },
  ])
})

app.post('/v1/pets', (_, res) => {
  res.json({ name: 'sparky', type: 'dog' })
})

app.get('/v1/pets/:id', (_, res) => {
  res.json({ id: req.params.id, type: 'dog', name: 'sparky' })
})

// 5a. Define route(s) to upload file(s)
app.post('/v1/pets/:id/photos', (req, res) => {
  // files are found in req.files
  // non-file multipart params can be found as such: req.body['my-param']
  res.json({
    files_metadata: req.files.map((f) => ({
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      // Buffer of file conents
      buffer: f.buffer,
    })),
  })
})

// 6. Create an tinyhttp error handler
app.use((err, req, res, next) => {
  // 7. Customize errors
  console.error(err) // dump error to console for debug
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  })
})

http.createServer(app).listen(3000)
