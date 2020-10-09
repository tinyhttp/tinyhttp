const search = document.querySelector('#search')
const code = document.querySelector('pre')

search.addEventListener(
  'keyup',
  async () => {
    const response = await fetch('/search/' + search.value)
    code.textContent = await response.text()
  },
  false
)
