const Fastify = require('fastify')
const middie = require('middie')

function one(req, res, next) {
  req.one = true
  next()
}

function two(req, res, next) {
  req.two = true
  next()
}

async function build() {
  // @ts-ignore
  const app = Fastify()
  await app.register(middie)
  app
    .use(one)
    .use(two)
    .get('/', (_, res) => void res.send('Hello'))
    .get('/user/:id', (req, res) => {
      // @ts-ignore
      res.send(`User: ${req.params.id}`)
    })
  return app
}

build().then((fastify) => fastify.listen(8000))
