import { App } from '@tinyhttp/app'
import { lruSend } from 'lru-send'

const URL = 'https://goweather.herokuapp.com/weather/'
const PORT = 3000
const app = new App().use(lruSend())

async function getWeatherByCity(city) {
  const result = await fetch(URL + city)
  return result.json()
}

app.get('/weather/search', async (req, res) => {
  const city = req.query.city
  const cacheResult = await getWeatherByCity(city)
  return res.status(200).send(cacheResult)
})

app.listen(PORT, () => console.log(`Started listening on Port ${PORT}`))
