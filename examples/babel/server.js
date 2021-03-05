import 'core-js/stable'
import { App } from '@tinyhttp/app'

const app = new App()

/* Some ES2019 stuff */
const myArray = [
  ['one', 1],
  ['two', 2],
  ['three', 3]
]
const obj = Object.fromEntries(myArray)

app.get('/', (_, res) => {
  res.send(obj)
})

app.listen(3000, () => console.log('Started on http://localhost:3000'))
