import path from 'node:path'
import { App } from '@tinyhttp/app'

const app = new App()
const db = {
  jedi: ['Yoda', 'Obi-Wan Kenobi', 'Luke Skywalker'],
  hero: ['Ironman', 'Thor', 'Doctor Strange']
}

/**
 * GET index.html file
 */
app.get('/', (_req, res) => {
  res.sendFile(path.resolve('public/index.html'), {}, (err) => {
    if (err) console.error(err)
  })
})

/**
 * GET client.js file
 */
app.get('/client.js', (_req, res) => {
  res.sendFile(path.resolve('public/client.js'), {}, (err) => {
    if (err) console.error(err)
  })
})

/**
 * GET logo.jpeg file
 */
app.get('/logo.jpeg', (_req, res) => {
  res.sendFile(path.resolve('public/logo.jpeg'), {}, (err) => {
    if (err) console.error(err)
  })
})

/**
 * GET search by :query
 */
app.get('/search/:query?', (req, res) => {
  res.send(db[req.params.query])
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
