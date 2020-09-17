import bench from 'autocannon'
import { spawn } from 'child_process'

const apps = ['tinyhttp.mjs', 'tinyhttp.cjs', 'express.js', 'polka.js', 'koa.js']

const run = (apps) => {
  if (apps.length === 0) return

  console.log('\n\n\n---------------------')
  console.log(`Running benchmark against ${apps[0]}`)
  console.log(`Apps left: ${apps.length}`)

  const instance = spawn('node', [apps[0]])

  const b = bench(
    {
      connections: 100,
      duration: 15,
      url: 'http://localhost:8000/user/123',
      title: apps[0],
    },
    () => {
      instance.kill('SIGINT')
      run(apps.slice(1))
    }
  )
  bench.track(b)
}

run(apps)
