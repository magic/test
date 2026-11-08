import { initDOM } from '#lib/dom/index.js'
import { has } from '#lib/has.js'
import { html, text, props } from '#lib/svelte/assert.js'

initDOM()

export default [
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<span>test</span>'
      const result = html(div)
      return result
    },
    expect: has.string('<span>test</span>'),
    info: 'html returns innerHTML',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = ''
      return html(div)
    },
    expect: '',
    info: 'html returns empty string for empty element',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.textContent = 'hello world'
      return text(div)
    },
    expect: 'hello world',
    info: 'text returns textContent',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      return text(div)
    },
    expect: '',
    info: 'text returns empty string for empty element',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.setAttribute('class', 'test-class')
      div.setAttribute('id', 'test-id')
      const result = props(div)
      return result
    },
    expect: has.properties({ class: 'test-class', id: 'test-id' }),
    info: 'props returns element attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      const result = props(div)
      return result
    },
    expect: {},
    info: 'props returns empty object for element with no attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.setAttribute('data-test', 'value')
      const result = props(div)
      return result
    },
    expect: has.property('data-test', 'value'),
    info: 'props returns data attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<p>paragraph</p><span>span</span>'
      return html(div)
    },
    expect: has.string('<p>paragraph</p>'),
    info: 'html handles multiple child elements',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<a href="#">link</a>'
      const result = html(div)
      return result
    },
    expect: has.string('<a'),
    info: 'html returns complete markup',
  },
]
