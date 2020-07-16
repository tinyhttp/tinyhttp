/* eslint-disable  */

// @ts-ignore
import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'

const App = () => {
  return html`<h1>Hello World</h1>
    <p>Your user-agent is: ${navigator.userAgent}</p>`
}

render(html`<${App} />`, document.getElementById('app'))
