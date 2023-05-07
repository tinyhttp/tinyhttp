import axios from 'axios'

const URL = 'https://goweather.herokuapp.com/weather/'

export async function getWeatherByCity(city) {
  const result = await axios.get(URL + city)
  return result.data
}
