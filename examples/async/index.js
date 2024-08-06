import { readFile } from 'node:fs/promises'
import { App } from '@tinyhttp/app'

const app = new App()

app.get('/', async (_, res) => {
  const file = await readFile(`${process.cwd()}/test.txt`)

  res.send(file.toString())
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
