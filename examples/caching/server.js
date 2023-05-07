import { App } from '@tinyhttp/app'
import { get, set } from './cache.js'
import { getWeatherByCity } from './weather.js'

const app = new App()

app.get('/weather/search', async (req, res) => {
  const t1 = new Date().getMilliseconds()
  const city = req.query.city
  let cacheResult = await get(city)
  if (cacheResult == null) {
    console.log('Cache miss!')
    cacheResult = await getWeatherByCity(city)
    await set(city, cacheResult, 1000000) // passive caching strategy
  } else console.log('Cache hit!')
  const elapsed_time = new Date().getMilliseconds() - t1
  return res.status(200).send({
    elapsed_time,
    ...cacheResult
  })
})

app.listen(3000, () => console.log('Started listening on Port 3000'))
