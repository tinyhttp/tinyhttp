import { App } from '@tinyhttp/app'
const app = new App({
  settings: {
    networkExtensions: true,
  },
})

app.use((req, res) => {
  // When you make a request, the IP and the Hostname should
  // stay completely the same whenever you are passing through a
  // reverse proxy or you are directly contacting the webserver
  res.end('Request IP: ' + req.ip + '\nRequest host: ' + req.hostname)
})

app.listen(3000)
