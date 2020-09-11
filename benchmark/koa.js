const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router()

function one(ctx, next) {
  ctx.req.one = true
  next()
}

function two(ctx, next) {
  ctx.req.two = true
  next()
}

router
  .use(one, two)
  .get('/favicon.ico', () => {})
  .get('/', (ctx) => (ctx.body = 'Hello'))
  .get('/user/:id', (ctx) => {
    ctx.body = `User: ${ctx.params.id}`
  })

app.use(router.routes()).use(router.allowedMethods()).listen(8000)
