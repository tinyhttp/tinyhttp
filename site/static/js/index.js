const cnt = document.getElementById('content')

const regex = /page\/.*/g

document.getElementById('editable').oninput = (e) => {
  const v = e.currentTarget.value

  const m = v.match(regex)

  if (v === '') {
    const header = document.createElement('h1')

    header.textContent = 'Hello World'

    cnt.innerHTML = ''
    cnt.appendChild(header)
  } else if (m) {
    cnt.innerHTML = `
    <h1>Some cool page</h1>
    <h2>URL</h2>
    ${v}
    <h2>Params</h2>
    { "page": "${m[0].slice(m[0].indexOf('/') + 1, m[0].length)}" }
    `
  } else {
    cnt.textContent = 'Not found'
  }
}
