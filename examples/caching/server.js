import { App } from '@tinyhttp/app'
import { getWeatherByCity } from './weather.js'
import { lruSend } from 'lru-send'

const PORT = 3000
const app = new App().use(lruSend())

app.get('/weather/search', async (req, res) => {
  const city = req.query.city
  const cacheResult = await getWeatherByCity(city)
  return res.status(200).send(cacheResult)
})

app.listen(PORT, () => console.log(`Started listening on Port ${PORT}`))
