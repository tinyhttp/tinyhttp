import { App } from '@tinyhttp/app'
import cluster from 'cluster'
import os from 'os'

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    if (signal) {
      console.log(`worker ${worker.id} was killed by signal: ${signal}`)
    } else if (code !== 0) {
      console.log(`worker ${worker.id} exited with error code: ${code}`)
    } else {
      console.log(`worker ${worker.id} success!`)
    }
  })
} else {
  const { id } = cluster.worker
  const app = new App()

  app.use((_, res) => void res.send(`Hello World from #${id} thread`))

  app.listen(3000, () => console.log(`Listening on #${id} thread`))
}
