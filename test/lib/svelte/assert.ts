import { initDOM } from '../../../src/lib/dom/index.js'
import { html, text, component, props } from '../../../src/lib/svelte/assert.js'

initDOM()

export default [
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<span>test</span>'
      const result = html(div as any)
      return result.includes('<span>test</span>')
    },
    expect: true,
    info: 'html returns innerHTML',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = ''
      return html(div as any) === ''
    },
    expect: true,
    info: 'html returns empty string for empty element',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.textContent = 'hello world'
      return text(div as any) === 'hello world'
    },
    expect: true,
    info: 'text returns textContent',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      return text(div as any) === ''
    },
    expect: true,
    info: 'text returns empty string for empty element',
  },
  {
    fn: () => {
      const instance = { test: true }
      const result = component(instance as any)
      return (result as any).test === true
    },
    expect: true,
    info: 'component returns the instance',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.setAttribute('class', 'test-class')
      div.setAttribute('id', 'test-id')
      const result = props(div as any)
      return result.class === 'test-class' && result.id === 'test-id'
    },
    expect: true,
    info: 'props returns element attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      const result = props(div as any)
      return Object.keys(result).length === 0
    },
    expect: true,
    info: 'props returns empty object for element with no attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.setAttribute('data-test', 'value')
      const result = props(div as any)
      return result['data-test'] === 'value'
    },
    expect: true,
    info: 'props returns data attributes',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<p>paragraph</p><span>span</span>'
      return html(div as any).includes('<p>paragraph</p>')
    },
    expect: true,
    info: 'html handles multiple child elements',
  },
  {
    fn: () => {
      const div = document.createElement('div')
      div.innerHTML = '<a href="#">link</a>'
      const result = html(div as any)
      return result.includes('<a')
    },
    expect: true,
    info: 'html returns complete markup',
  },
]
