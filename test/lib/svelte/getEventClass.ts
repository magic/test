import {
  Event,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  PointerEvent,
  TouchEvent,
  ClipboardEvent,
  AnimationEvent,
  WheelEvent,
} from 'happy-dom'

import { getEventClass, DragEvent, TransitionEvent } from '../../../src/lib/svelte/events.js'
import type { Test } from '../../../src/types.js'

export default [
  {
    fn: async () => getEventClass('pointer'),
    expect: () => PointerEvent,
    info: 'pointer* events return PointerEvent',
  },
  {
    fn: async () => getEventClass('mouse'),
    expect: () => MouseEvent,
    info: 'mouse* events return MouseEvent',
  },
  {
    fn: async () => getEventClass('key'),
    expect: () => KeyboardEvent,
    info: 'key* events return KeyboardEvent',
  },
  {
    fn: async () => getEventClass('touch'),
    expect: () => TouchEvent,
    info: 'touch* events return TouchEvent',
  },
  {
    fn: async () => getEventClass('drag'),
    expect: () => DragEvent,
    info: 'drag* events return DragEvent',
  },
  {
    fn: async () => getEventClass('wheel'),
    expect: () => WheelEvent,
    info: 'wheel* events return wheelEvent',
  },
  {
    fn: async () => getEventClass('focus'),
    expect: () => FocusEvent,
    info: 'focus* events return FocusEvent',
  },
  {
    fn: async () => getEventClass('animation'),
    expect: () => AnimationEvent,
    info: 'animation* events return AnimationEvent',
  },
  {
    fn: async () => getEventClass('transition'),
    expect: () => TransitionEvent,
    info: 'transition* events return TransitionEvent',
  },
  {
    fn: async () => getEventClass('clipboard'),
    expect: () => ClipboardEvent,
    info: 'clipboard* events return ClipboardEvent',
  },
  {
    fn: async () => getEventClass('anyother'),
    expect: () => Event,
    info: 'unknown events return Event',
  },
] satisfies Test[]
