import { App } from '../../packages/app/src'
import { readFile } from 'fs/promises'

new App()
  .get('/', async (_, res, next) => {
    let file: Buffer

    try {
      file = await readFile(`${__dirname}/test.txt`)
    } catch (e) {
      next(e)
    }
    res.send(file.toString())
  })
  .listen(3000, () => console.log('Started on http://localhost:3000'))
