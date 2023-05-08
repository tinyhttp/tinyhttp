const URL = 'https://goweather.herokuapp.com/weather/'

export async function getWeatherByCity(city) {
  const result = await fetch(URL + city)
  return result.json()
}
