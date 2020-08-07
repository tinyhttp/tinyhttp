/* eslint-disable  */

// @ts-ignore
import { html, render } from '/htm.js'

const App = () => {
  return location.pathname === '/'
    ? html`<h1>Hello World</h1>
        <p>Your user-agent is: ${navigator.userAgent}</p>`
    : html`<h1>You visited ${location.pathname}</h1>`
}

render(html`<${App} />`, document.getElementById('app'))
