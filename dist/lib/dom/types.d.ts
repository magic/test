export interface SimpleEvent {
  type: string
  target?: unknown
  currentTarget?: unknown
}
export interface ImageInstance {
  _nodeCanvasImage?: unknown
  onload?: (event: SimpleEvent) => void
  addEventListener?: (type: string, listener: (event: SimpleEvent) => void) => void
  dispatchEvent: (event: SimpleEvent) => boolean
  width: number
  height: number
  complete: boolean
  src: string
}
export interface ImageConstructor {
  new (): ImageInstance
  prototype: ImageInstance
}
export interface CanvasRenderingContext2D {
  drawImage: (img: unknown, ...args: unknown[]) => void
  toDataURL: (mimeType?: string, quality?: number) => string
}
export interface CustomWindow {
  document: unknown
  [key: string]: unknown
  Image: ImageConstructor
  HTMLImageElement: {
    prototype: ImageInstance
  }
  HTMLCanvasElement: {
    prototype: {
      getContext: unknown
      width: number
      height: number
      toDataURL: unknown
    }
  }
  Event: new (type: string, eventInitDict?: unknown) => SimpleEvent
  navigator: unknown
  location: unknown
  history: unknown
  Node: unknown
  Element: unknown
  HTMLElement: unknown
  SVGElement: unknown
  Document: unknown
  DocumentFragment: unknown
  Comment: unknown
  Text: unknown
  CustomEvent: unknown
  MouseEvent: unknown
  KeyboardEvent: unknown
  InputEvent: unknown
  TouchEvent: unknown
  PointerEvent: unknown
  FormData: unknown
  File: unknown
  FileList: unknown
  Blob: unknown
  URL: unknown
  URLSearchParams: unknown
  MutationObserver: unknown
  IntersectionObserver: unknown
  ResizeObserver: unknown
  PerformanceObserver: unknown
  FileReader: unknown
  AbortController: unknown
  AbortSignal: unknown
  ReadableStream: unknown
  WritableStream: unknown
  TransformStream: unknown
  XMLHttpRequest: unknown
  DOMParser: unknown
  XMLSerializer: unknown
  WebSocket: unknown
  CustomElementRegistry: unknown
  MessagePort: unknown
  MediaStream: unknown
  MediaStreamTrack: unknown
  Audio: unknown
  TextEncoder: unknown
  TextDecoder: unknown
  atob: (encoded: string) => string
  btoa: (decoded: string) => string
  Storage: unknown
  sessionStorage: unknown
  localStorage: unknown
  Headers: unknown
  Request: unknown
  Response: unknown
  setTimeout: unknown
  clearTimeout: unknown
  setInterval: unknown
  clearInterval: unknown
  requestAnimationFrame: unknown
  cancelAnimationFrame: unknown
  fetch: unknown
  queueMicrotask: unknown
  globalThis: unknown
}
