import htm from 'https://unpkg.com/htm?module'
const html = htm.bind(React.createElement)

const App = () => {
  return location.pathname === '/'
    ? html`<h1>Hello World</h1>
        <p>Your user-agent is: ${navigator.userAgent}</p>`
    : html`<h1>You visited ${location.pathname}</h1>`
}

ReactDOM.hydrate(html`<${App} />`, document.getElementById('app'))
