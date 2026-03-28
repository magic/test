import { initDOM, getDocument } from '../../../src/lib/svelte/dom.js'
import { click, trigger, scroll } from '../../../src/lib/svelte/events.js'

initDOM()
const doc = getDocument()

export default [
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let clicked = false
      div.addEventListener('click', () => {
        clicked = true
      })
      click(div)
      return clicked
    },
    expect: true,
    info: 'click triggers click event on element',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let eventFired = false
      div.addEventListener('custom', () => {
        eventFired = true
      })
      trigger(div, 'custom')
      return eventFired
    },
    expect: true,
    info: 'trigger fires custom event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let eventFired = false
      div.addEventListener('focus', () => {
        eventFired = true
      })
      trigger(div, 'focus')
      return eventFired
    },
    expect: true,
    info: 'trigger fires focus event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let eventFired = false
      div.addEventListener('input', e => {
        eventFired = e.bubbles
      })
      trigger(div, 'input', { bubbles: true })
      return eventFired
    },
    expect: true,
    info: 'trigger fires event with custom options',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let scrolled = false
      div.addEventListener('scroll', () => {
        scrolled = true
      })
      scroll(div)
      return scrolled
    },
    expect: true,
    info: 'scroll fires scroll event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      scroll(div, 50, 50)
      let eventFired = false
      div.addEventListener('scroll', e => {
        eventFired = e.bubbles
      })
      scroll(div, 100, 100)
      return eventFired
    },
    expect: true,
    info: 'scroll event bubbles',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let clicked = false
      div.addEventListener('click', () => {
        clicked = true
      })
      const el = div.querySelector('.not-exist')
      if (!el) {
        click(div, '.not-exist')
      }
      return clicked
    },
    expect: false,
    info: 'click with non-existent selector does not trigger',
  },
]
