import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'

const app = new App()

app.get('/', async (_, res, next) => {
  let file

  try {
    file = await readFile(`${process.cwd()}/test.txt`)
  } catch (e) {
    next(e)
  }
  res.send(file.toString())
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
