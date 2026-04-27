import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new MediaStream(),
      expect: (t: MediaStream) => is.instance(t, MediaStream),
      info: 'MediaStream is callable with new',
    },
    {
      fn: () => new MediaStream(),
      expect: is.object,
      info: 'MediaStream is callable with new',
    },
    {
      fn: () => {
        const stream = new MediaStream()
        return stream.addTrack
      },
      expect: is.function,
      info: 'MediaStream has addTrack method',
    },
    {
      fn: () => {
        const stream = new MediaStream()
        return stream.removeTrack
      },
      expect: is.function,
      info: 'MediaStream has removeTrack method',
    },
    {
      fn: () => {
        const stream = new MediaStream()
        return stream.getAudioTracks
      },
      expect: is.function,
      info: 'MediaStream has getAudioTracks method',
    },
    {
      fn: () => {
        const stream = new MediaStream()
        return stream.getVideoTracks
      },
      expect: is.function,
      info: 'MediaStream has getVideoTracks method',
    },
  ],
}
