/* eslint-disable  */

// @ts-ignore

import { h, app, text } from '/hyperapp.js'

const state = {
  text: 'Hello',
}

const actions = {
  setText: (state, event) => {
    return {
      ...state,
      text: event.target.value,
    }
  },
}

const view = (state) =>
  h('main', {}, [
    h('h1', {}, [text(state.text)]),
    h('input', {
      value: state.text,
      oninput: actions.setText,
    }),
  ])

app({ init: state, view, node: document.getElementById('app') })
