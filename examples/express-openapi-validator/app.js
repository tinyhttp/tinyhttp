import { App } from '@tinyhttp/app'

import fs from 'fs'
import { OpenApiValidator } from 'express-openapi-validate'
import jsYaml from 'js-yaml'
import { urlencoded, text, json } from 'milliparsec'

import Pets from './services/index.js'

const openApiDocument = jsYaml.safeLoad(fs.readFileSync('api.yaml', 'utf-8'))

const validator = new OpenApiValidator(openApiDocument)

const port = 3000

const app = new App({
  onError: (err, _, res) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
      data: err.data,
    })
  },
})

// 1. Install body parsers from milliparsec for the request types your API will support
app.use(urlencoded({ extended: false }))
app.use(text())
app.use(json())

app.use(validator.match())

const pets = new Pets()

// 3. Add routes
app.get('/v1/ping', (_, res) => {
  res.send('pong')
})

app.get('/v1/pets', (req, res) => {
  res.json(pets.findAll(req.query))
})

app.post('/v1/pets', (req, res) => {
  res.json(pets.create({ ...req.body }))
})

app.delete('/v1/pets/:id', (req, res) => {
  res.json(pets.delete(req.params.id))
})

app.get('/v1/pets/:id', (req, res) => {
  const pet = pets.findById(req.params.id)
  return pet ? res.json({ pet }) : res.status(404).json({ message: 'not found' })
})

// 3a. Add a route upload file(s)
app.post('/v1/pets/:id/photos', (req, res) => {
  // DO something with the file
  // files are found in req.files
  // non file multipar params are in req.body['my-param']
  console.log(req.files)

  res.json({
    files_metadata: req.files.map((f) => ({
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      // Buffer of file conents
      // buffer: f.buffer,
    })),
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
