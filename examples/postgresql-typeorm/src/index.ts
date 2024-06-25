import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { User } from './entity/User'
import { App, type Request, type Response } from '@tinyhttp/app'
import { json } from 'milliparsec'

const users = [
  {
    firstName: 'Homer',
    lastName: 'Simpson',
    age: 42
  },
  {
    firstName: 'Philip J.',
    lastName: 'Fry',
    age: 25
  },
  {
    firstName: 'Stanley',
    lastName: 'Smith',
    age: 42
  }
]

createConnection()
  .then(async (connection) => {
    console.log('Inserting a few new users into the database...')
    for (const user of users) {
      const dbUser = new User()
      dbUser.firstName = user.firstName
      dbUser.lastName = user.lastName
      dbUser.age = user.age
      await connection.manager.save(dbUser)
      console.log(`Saved a new user with id: ${dbUser.id}`)
    }

    console.log('Loading users from the database...')
    const dbUsers = await connection.manager.find(User)
    console.log('Loaded users: ', dbUsers)

    const userRepository = connection.getRepository(User)

    // create and setup tinyhttp app
    const app = new App()
    app.use('/users', json())

    // register routes

    app.get('/users', async (req: Request, res: Response, next) => {
      try {
        const users = await userRepository.find()
        res.json(users)
      } catch (err) {
        next(err)
      }
    })

    app.get('/users/:id', async (req: Request, res: Response, next) => {
      try {
        const user = await userRepository.findOne(req.params.id)
        res.json(user)
      } catch (err) {
        next(err)
      }
    })

    app.post('/users', async (req: Request, res: Response, next) => {
      try {
        const { firstName, lastName, age } = req.body

        const user = new User()
        user.firstName = firstName
        user.lastName = lastName
        user.age = age

        const dbUser = await userRepository.save(user)
        res.send({ message: `Saved a new user with id "${dbUser.id}"`, data: dbUser })
      } catch (err) {
        next(err)
      }
    })

    app.put('/users/:id', async (req: Request, res: Response, next) => {
      try {
        const { firstName, lastName, age } = req.body

        const user = await userRepository.findOne(req.params.id)
        user.firstName = firstName || user.firstName
        user.lastName = lastName || user.lastName
        user.age = age || user.age

        const dbUser = await userRepository.save(user)
        res.send({ message: `Updated the user with id "${dbUser.id}"`, data: dbUser })
      } catch (err) {
        next(err)
      }
    })

    app.delete('/users', async (req: Request, res: Response, next) => {
      try {
        const { id } = req.body
        const user = await userRepository.findOne(id)
        const dbUser = await userRepository.remove(user)
        res.send({ message: `Removed the user with id "${dbUser.id}"`, data: dbUser })
      } catch (err) {
        next(err)
      }
    })

    // start tinyhttp server
    app.listen(3000, () => console.log('Started on http://localhost:3000'))
  })
  .catch((error) => console.log(error))
