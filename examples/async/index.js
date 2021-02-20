import { App } from '@tinyhttp/app'
import { readFile } from 'fs/promises'

const app = new App()

app.get('/', async (_, res) => {
  res.sendFile(`${process.cwd()}/test.txt`)
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
