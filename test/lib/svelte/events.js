import { initDOM, getDocument } from '../../../src/lib/svelte/dom.js'
import { fireEvent, click, dblClick, contextMenu, mouseDown, mouseUp, mouseMove, mouseEnter, mouseLeave, mouseOver, mouseOut, keyDown, keyPress, keyUp, type, input, change, blur, focus, focusIn, focusOut, submit, pointerDown, pointerUp, pointerMove, pointerOver, pointerOut, touchStart, touchEnd, touchMove, copy, cut, paste, dragStart, drag, dragEnd, dragOver, dragEnter, dragLeave, drop, resize, scroll, trigger } from '../../../src/lib/svelte/events.js'

initDOM()
const doc = getDocument()

export default [
  // click
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let clicked = false
      div.addEventListener('click', () => { clicked = true })
      click(div)
      return clicked
    },
    expect: true,
    info: 'click triggers click event on element',
  },
  // dblClick
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('dblclick', () => { fired = true })
      dblClick(div)
      return fired
    },
    expect: true,
    info: 'dblClick triggers dblclick event',
  },
  // contextMenu
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('contextmenu', () => { fired = true })
      contextMenu(div)
      return fired
    },
    expect: true,
    info: 'contextMenu triggers contextmenu event',
  },
  // mouse events
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mousedown', () => { fired = true })
      mouseDown(div)
      return fired
    },
    expect: true,
    info: 'mouseDown triggers mousedown event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mouseup', () => { fired = true })
      mouseUp(div)
      return fired
    },
    expect: true,
    info: 'mouseUp triggers mouseup event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mousemove', () => { fired = true })
      mouseMove(div)
      return fired
    },
    expect: true,
    info: 'mouseMove triggers mousemove event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mouseenter', () => { fired = true })
      mouseEnter(div)
      return fired
    },
    expect: true,
    info: 'mouseEnter triggers mouseenter event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mouseleave', () => { fired = true })
      mouseLeave(div)
      return fired
    },
    expect: true,
    info: 'mouseLeave triggers mouseleave event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mouseover', () => { fired = true })
      mouseOver(div)
      return fired
    },
    expect: true,
    info: 'mouseOver triggers mouseover event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('mouseout', () => { fired = true })
      mouseOut(div)
      return fired
    },
    expect: true,
    info: 'mouseOut triggers mouseout event',
  },
  // keyboard events
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('keydown', () => { fired = true })
      keyDown(div)
      return fired
    },
    expect: true,
    info: 'keyDown triggers keydown event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('keypress', () => { fired = true })
      keyPress(div)
      return fired
    },
    expect: true,
    info: 'keyPress triggers keypress event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('keyup', () => { fired = true })
      keyUp(div)
      return fired
    },
    expect: true,
    info: 'keyUp triggers keyup event',
  },
  {
    fn: () => {
      const div = doc.createElement('input')
      doc.body.appendChild(div)
      let keys = []
      div.addEventListener('keydown', e => { keys.push(e.key) })
      div.addEventListener('keyup', e => { keys.push(e.key) })
      type(div, 'ab')
      return keys.join(',')
    },
    expect: 'a,a,b,b',
    info: 'type fires keydown and keyup for each character',
  },
  // input/change events
  {
    fn: () => {
      const el = doc.createElement('input')
      doc.body.appendChild(el)
      let fired = false
      el.addEventListener('input', () => { fired = true })
      input(el, 'test')
      return fired
    },
    expect: true,
    info: 'input triggers input event',
  },
  {
    fn: () => {
      const el = doc.createElement('input')
      doc.body.appendChild(el)
      let fired = false
      el.addEventListener('change', () => { fired = true })
      change(el, 'test')
      return fired
    },
    expect: true,
    info: 'change triggers change event',
  },
  {
    fn: () => {
      const el = doc.createElement('input')
      doc.body.appendChild(el)
      let fired = false
      el.addEventListener('blur', () => { fired = true })
      blur(el)
      return fired
    },
    expect: true,
    info: 'blur triggers blur event',
  },
  // focus events - not fully supported in happy-dom
  {
    fn: () => {
      const form = doc.createElement('form')
      doc.body.appendChild(form)
      let fired = false
      form.addEventListener('submit', e => { e.preventDefault(); fired = true })
      submit(form)
      return fired
    },
    expect: true,
    info: 'submit triggers submit event',
  },
  // pointer events
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('pointerdown', () => { fired = true })
      pointerDown(div)
      return fired
    },
    expect: true,
    info: 'pointerDown triggers pointerdown event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('pointerup', () => { fired = true })
      pointerUp(div)
      return fired
    },
    expect: true,
    info: 'pointerUp triggers pointerup event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('pointermove', () => { fired = true })
      pointerMove(div)
      return fired
    },
    expect: true,
    info: 'pointerMove triggers pointermove event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('pointerover', () => { fired = true })
      pointerOver(div)
      return fired
    },
    expect: true,
    info: 'pointerOver triggers pointerover event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('pointerout', () => { fired = true })
      pointerOut(div)
      return fired
    },
    expect: true,
    info: 'pointerOut triggers pointerout event',
  },
  // touch events
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('touchstart', () => { fired = true })
      touchStart(div)
      return fired
    },
    expect: true,
    info: 'touchStart triggers touchstart event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('touchend', () => { fired = true })
      touchEnd(div)
      return fired
    },
    expect: true,
    info: 'touchEnd triggers touchend event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('touchmove', () => { fired = true })
      touchMove(div)
      return fired
    },
    expect: true,
    info: 'touchMove triggers touchmove event',
  },
  // clipboard events - not fully supported in happy-dom, skipping
  // drag events - not fully supported in happy-dom, skipping
  // scroll
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('scroll', () => { fired = true })
      scroll(div)
      return fired
    },
    expect: true,
    info: 'scroll fires scroll event',
  },
  // Note: checked function relies on Object.defineProperty which happy-dom handles differently
  // Testing input/change instead as they cover similar functionality
  // trigger (generic)
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let eventFired = false
      div.addEventListener('custom', () => { eventFired = true })
      trigger(div, 'custom')
      return eventFired
    },
    expect: true,
    info: 'trigger fires custom event',
  },
  // fireEvent object
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('click', () => { fired = true })
      fireEvent.click(div)
      return fired
    },
    expect: true,
    info: 'fireEvent.click triggers click event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('input', () => { fired = true })
      fireEvent.input(div, 'test')
      return fired
    },
    expect: true,
    info: 'fireEvent.input triggers input event',
  },
  {
    fn: () => {
      const div = doc.createElement('div')
      doc.body.appendChild(div)
      let fired = false
      div.addEventListener('keydown', () => { fired = true })
      fireEvent.keyDown(div, { key: 'Enter' })
      return fired
    },
    expect: true,
    info: 'fireEvent.keyDown triggers keydown event with options',
  },
  // selector with fireEvent
  {
    fn: () => {
      const container = doc.createElement('div')
      const child = doc.createElement('button')
      container.appendChild(child)
      doc.body.appendChild(container)
      let fired = false
      child.addEventListener('click', () => { fired = true })
      fireEvent.click(container, 'button')
      return fired
    },
    expect: true,
    info: 'fireEvent can trigger on child via selector',
  },
]
