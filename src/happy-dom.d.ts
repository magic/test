/**
 * Local type declarations for happy-dom
 * Since happy-dom doesn't ship with .d.ts files and there's no @types/happy-dom,
 * we create minimal types for what's used in this library.
 */

declare module 'happy-dom' {
  export interface Window {
    document: Document
    navigator: Navigator
    location: Location
    history: History
    Node: typeof Node
    Element: typeof Element
    HTMLElement: typeof HTMLElement
    SVGElement: typeof SVGElement
    Document: typeof Document
    DocumentFragment: typeof DocumentFragment
    Comment: typeof Comment
    Text: typeof Text
    Event: typeof Event
    CustomEvent: typeof CustomEvent
    MouseEvent: typeof MouseEvent
    KeyboardEvent: typeof KeyboardEvent
    InputEvent: typeof InputEvent
    TouchEvent: typeof TouchEvent
    PointerEvent: typeof PointerEvent
    FormData: typeof FormData
    File: typeof File
    FileList: typeof FileList
    Blob: typeof Blob
    FileReader: typeof FileReader
    URL: typeof URL
    URLSearchParams: typeof URLSearchParams
    TextEncoder: typeof TextEncoder
    TextDecoder: typeof TextDecoder
    MutationObserver: typeof MutationObserver
    IntersectionObserver: typeof IntersectionObserver
    ResizeObserver: typeof ResizeObserver
    PerformanceObserver: typeof PerformanceObserver
    Headers: typeof Headers
    Request: typeof Request
    Response: typeof Response
    AbortController: typeof AbortController
    AbortSignal: typeof AbortSignal
    ReadableStream: typeof ReadableStream
    WritableStream: typeof WritableStream
    TransformStream: typeof TransformStream
    WebSocket: typeof WebSocket
    DOMParser: typeof DOMParser
    XMLSerializer: typeof XMLSerializer
    CustomElementRegistry: typeof CustomElementRegistry
    MessagePort: typeof MessagePort
    MediaStream: typeof MediaStream
    MediaStreamTrack: typeof MediaStreamTrack
    Audio: typeof Audio
    XMLHttpRequest: typeof XMLHttpRequest
    Storage: typeof Storage
    sessionStorage: Storage
    localStorage: Storage
    Image: typeof HTMLImageElement
    HTMLImageElement: typeof HTMLImageElement
    HTMLCanvasElement: typeof HTMLCanvasElement
    setTimeout: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number
    clearTimeout: (handle: number) => void
    setInterval: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number
    clearInterval: (handle: number) => void
    requestAnimationFrame: (callback: (time: number) => void) => number
    cancelAnimationFrame: (handle: number) => void
    fetch: typeof fetch
    queueMicrotask: (callback: () => void) => void
    atob: typeof atob
    btoa: typeof btoa
    crypto: Crypto
  }

  export interface Navigator {
    userAgent: string
    language: string
    languages: string[]
    platform: string
    onLine: boolean
    hardwareConcurrency: number
  }

  export interface Location {
    href: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
    origin: string
    assign(url: string): void
    replace(url: string): void
    reload(force?: boolean): void
  }

  export interface History {
    readonly length: number
    state: any
    pushState(data: any, title: string, url?: string | null): void
    replaceState(data: any, title: string, url?: string | null): void
    go(delta?: number): void
    back(): void
    forward(): void
  }

  export interface Document extends ParentNode {}

  export interface ParentNode {
    readonly ownerDocument: Document | null
    querySelector(selectors: string): Element | null
    querySelectorAll(selectors: string): HTMLCollection
  }

  export interface Node {
    readonly nodeType: number
    readonly nodeName: string
    readonly parentNode: Node | null
    readonly parentElement: Element | null
    textContent: string | null
    innerHTML: string
    appendChild<T extends Node>(node: T): T
    removeChild<T extends Node>(oldChild: T): T
    replaceChild<T extends Node>(newChild: Node, oldChild: T): T
    cloneNode(deep?: boolean): Node
    contains(node: Node): boolean
  }

  export interface Element extends Node, ParentNode, DOMTokenList {
    readonly tagName: string
    id: string
    className: string
    classList: DOMTokenList
    getAttribute(name: string): string | null
    setAttribute(name: string, value: string): void
    removeAttribute(name: string): void
    hasAttribute(name: string): boolean
    getBoundingClientRect(): DOMRect
    getElementsByClassName(classNames: string): HTMLCollection
    getElementsByTagName(tagName: string): HTMLCollection
    closest(selectors: string): Element | null
    matches(selectors: string): boolean
    attributes: NamedNodeMap
  }

  export interface HTMLElement extends Element {
    innerText: string
    textContent: string
    style: CSSStyleDeclaration
    readonly offsetHeight: number
    readonly offsetWidth: number
    readonly offsetLeft: number
    readonly offsetTop: number
    readonly offsetParent: HTMLElement | null
    focus(): void
    blur(): void
    click(): void
    scrollIntoView(options?: ScrollIntoViewOptions | boolean): void
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions,
    ): void
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions,
    ): void
    dispatchEvent(event: Event): boolean
  }

  export interface HTMLImageElement extends HTMLElement {
    src: string
    alt: string
    width: number
    height: number
    complete: boolean
    naturalWidth: number
    naturalHeight: number
    onload: ((this: HTMLImageElement, ev: Event) => any) | null
    onerror: ((this: HTMLImageElement, ev: Event) => any) | null
    loading: string
    decoding: string
    // Additional properties for prototype polyfills
    _nodeCanvasImage?: unknown
  }

  export interface HTMLCanvasElement extends HTMLElement {
    width: number
    height: number
    getContext(
      contextId: '2d' | 'webgl' | 'webgl2',
    ): CanvasRenderingContext2D | WebGLRenderingContext | null
    toDataURL(type?: string, quality?: number): string
    toBlob(callback: ((blob: Blob | null) => void) | null, type?: string, quality?: number): void
  }

  // CanvasRenderingContext2D for getContext support
  export interface CanvasRenderingContext2D {
    canvas: HTMLCanvasElement
    fillStyle: string | CanvasGradient | CanvasPattern
    strokeStyle: string | CanvasGradient | CanvasPattern
    font: string
    textAlign: string
    textBaseline: string
    globalAlpha: number
    globalCompositeOperation: string
    imageSmoothingEnabled: boolean
    lineWidth: number
    lineCap: string
    lineJoin: string
    miterLimit: number
    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number
    clearRect(x: number, y: number, w: number, h: number): void
    fillRect(x: number, y: number, w: number, h: number): void
    strokeRect(x: number, y: number, w: number, h: number): void
    fillText(text: string, x: number, y: number, maxWidth?: number): void
    strokeText(text: string, x: number, y: number, maxWidth?: number): number
    measureText(text: string): TextMetrics
    drawImage(img: CanvasImageSource, dx: number, dy: number, dw?: number, dh?: number): void
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient
    createRadialGradient(
      x0: number,
      y0: number,
      r0: number,
      x1: number,
      y1: number,
      r1: number,
    ): CanvasGradient
    createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null
    beginPath(): void
    closePath(): void
    moveTo(x: number, y: number): void
    lineTo(x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    bezierCurveTo(
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number,
    ): void
    arc(
      x: number,
      y: number,
      r: number,
      sAngle: number,
      eAngle: number,
      counterclockwise?: boolean,
    ): void
    arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void
    ellipse(
      x: number,
      y: number,
      rx: number,
      ry: number,
      rotation: number,
      sAngle: number,
      eAngle: number,
      counterclockwise?: boolean,
    ): void
    rect(x: number, y: number, w: number, h: number): void
    fill(): void
    stroke(): void
    clip(): void
    isPointInPath(x: number, y: number): boolean
    isPointInStroke(x: number, y: number): boolean
    rotate(angle: number): void
    scale(x: number, y: number): void
    translate(x: number, y: number): void
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void
    resetTransform(): void
    drawImage(img: unknown, ...args: unknown[]): void
  }

  export interface TextMetrics {
    readonly width: number
    readonly actualBoundingBoxLeft: number
    readonly actualBoundingBoxRight: number
    readonly fontBoundingBoxAscent: number
    readonly fontBoundingBoxDescent: number
    readonly alphabeticBaseline: number
    readonly emHeightAscent: number
    readonly emHeightDescent: number
    readonly hangingBaseline: number
    readonly ideographicBaseline: number
  }

  export interface CanvasGradient {}

  export interface CanvasPattern {}

  export type CanvasImageSource =
    | HTMLImageElement
    | HTMLCanvasElement
    | VideoBitmap
    | OffscreenCanvas
    | ImageData
    | Blob
    | ImageBitmap

  export interface HTMLCanvasElement extends HTMLElement {
    width: number
    height: number
    getContext(
      contextId: '2d' | 'webgl' | 'webgl2',
    ): CanvasRenderingContext2D | WebGLRenderingContext | null
    toDataURL(type?: string, quality?: number): string
    toBlob(callback: ((blob: Blob | null) => void) | null, type?: string, quality?: number): void
  }

  export interface HTMLCollection extends Iterable<Element> {
    readonly length: number
    item(index: number): Element | null
    namedItem(name: string): Element | null
    [index: number]: Element
  }

  export interface DOMTokenList extends Iterable<string> {
    readonly length: number
    add(...tokens: string[]): void
    remove(...tokens: string[]): void
    toggle(token: string, force?: boolean): boolean
    contains(token: string): boolean
    replace(oldToken: string, newToken: string): boolean
    supports(token: string): boolean
    value: string
    [index: number]: string
  }

  export interface CSSStyleDeclaration {
    [prop: string]: string | null
    display: string
    position: string
    top: string
    left: string
    width: string
    height: string
    margin: string
    padding: string
    border: string
    background: string
    backgroundColor: string
    color: string
    fontSize: string
    fontFamily: string
    fontWeight: string
    textAlign: string
    verticalAlign: string
    overflow: string
    visibility: string
    opacity: string
    transform: string
    transition: string
    flex: string
    flexDirection: string
    justifyContent: string
    alignItems: string
    zIndex: string
  }

  export interface DOMRect {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
    readonly top: number
    readonly right: number
    readonly bottom: number
    readonly left: number
  }

  export interface NamedNodeMap extends Iterable<Attr> {
    readonly length: number
    getNamedItem(name: string): Attr | null
    setNamedItem(attr: Attr): Attr | null
    removeNamedItem(name: string): Attr | null
    item(index: number): Attr | null
  }

  export interface Attr {
    readonly name: string
    readonly value: string
    readonly specified: boolean
  }

  export interface Event {
    readonly type: string
    readonly target: EventTarget | null
    readonly currentTarget: EventTarget | null
    readonly bubbles: boolean
    readonly cancelable: boolean
    readonly defaultPrevented: boolean
    readonly isTrusted: boolean
    readonly timeStamp: number
    preventDefault(): void
    stopPropagation(): void
    stopImmediatePropagation(): void
    initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void
  }

  export interface MouseEvent extends UIEvent {
    readonly screenX: number
    readonly screenY: number
    readonly clientX: number
    readonly clientY: number
    readonly ctrlKey: boolean
    readonly shiftKey: boolean
    readonly altKey: boolean
    readonly metaKey: boolean
    readonly button: number
    readonly buttons: number
    readonly relatedTarget: EventTarget | null
    initMouseEvent(
      type: string,
      bubbles?: boolean,
      cancelable?: boolean,
      view?: Window,
      detail?: number,
      screenX?: number,
      screenY?: number,
      clientX?: number,
      clientY?: number,
      ctrlKey?: boolean,
      altKey?: boolean,
      shiftKey?: boolean,
      metaKey?: boolean,
      button?: number,
      relatedTarget?: EventTarget | null,
    ): void
  }

  export interface UIEvent extends Event {
    readonly view: Window | null
    readonly detail: number
  }

  export interface KeyboardEvent extends UIEvent {
    readonly key: string
    readonly code: string
    readonly ctrlKey: boolean
    readonly shiftKey: boolean
    readonly altKey: boolean
    readonly metaKey: boolean
    readonly repeat: boolean
    initKeyboardEvent(
      type: string,
      bubbles?: boolean,
      cancelable?: boolean,
      view?: Window,
      key?: string,
      code?: string,
    ): void
  }

  export interface InputEvent extends UIEvent {
    readonly data: string | null
    readonly inputType: string
    readonly isComposing: boolean
  }

  export interface TouchEvent extends UIEvent {
    readonly touches: TouchList
    readonly targetTouches: TouchList
    readonly changedTouches: TouchList
    readonly ctrlKey: boolean
    readonly shiftKey: boolean
    readonly altKey: boolean
    readonly metaKey: boolean
  }

  export interface TouchList extends Iterable<Touch> {
    readonly length: number
    item(index: number): Touch | null
    [index: number]: Touch
  }

  export interface Touch {
    readonly identifier: number
    readonly target: EventTarget
    readonly clientX: number
    readonly clientY: number
    readonly screenX: number
    readonly screenY: number
  }

  export interface PointerEvent extends MouseEvent {
    readonly pointerId: number
    readonly width: number
    readonly height: number
    readonly pressure: number
    readonly tangentialPressure: number
    readonly twist: number
    readonly pointerType: string
    readonly isPrimary: boolean
  }

  export interface CustomEvent extends Event {
    readonly detail: any
    initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: any): void
  }

  export interface EventTarget {
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions,
    ): void
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions,
    ): void
    dispatchEvent(event: Event): boolean
  }

  export interface DocumentFragment extends Node, ParentNode {}

  export interface Comment extends Text {}

  export interface Text extends CharacterData {}

  export interface CharacterData extends Node {
    data: string
    length: number
    substringData(offset: number, count: number): string
    appendData(data: string): void
    insertData(offset: number, data: string): void
    deleteData(offset: number, count: number): void
    replaceData(offset: number, count: number, data: string): void
  }

  export interface SVGElement extends Element {
    id: string
    ownerSVGElement: SVGSVGElement | null
    viewportElement: SVGElement | null
  }

  export interface SVGSVGElement extends SVGElement {
    width: number
    height: number
    viewBox: string
  }

  export interface FormData {
    append(name: string, value: string | Blob, fileName?: string): void
    delete(name: string): void
    get(name: string): string | File | null
    getAll(name: string): Array<string | File>
    has(name: string): boolean
    set(name: string, value: string | Blob, fileName?: string): void
  }

  export interface File extends Blob {
    readonly name: string
    readonly lastModified: number
    readonly webkitRelativePath: string
  }

  export interface FileList extends Iterable<File> {
    readonly length: number
    item(index: number): File | null
    [index: number]: File
  }

  export interface Blob {
    readonly size: number
    readonly type: string
    slice(start?: number, end?: number, contentType?: string): Blob
    stream(): ReadableStream
    text(): Promise<string>
    arrayBuffer(): Promise<ArrayBuffer>
  }

  export interface FileReader extends EventTarget {
    readonly result: string | ArrayBuffer | null
    readonly error: DOMException | null
    readonly readyState: number
    readAsText(blob: Blob, encoding?: string): void
    readAsDataURL(blob: Blob): void
    readAsArrayBuffer(blob: Blob): void
    abort(): void
    onload: ((this: FileReader, ev: ProgressEvent) => any) | null
    onerror: ((this: FileReader, ev: ProgressEvent) => any) | null
    onabort: ((this: FileReader, ev: ProgressEvent) => any) | null
    onloadstart: ((this: FileReader, ev: ProgressEvent) => any) | null
    onloadend: ((this: FileReader, ev: ProgressEvent) => any) | null
    onprogress: ((this: FileReader, ev: ProgressEvent) => any) | null
  }

  export interface Storage {
    readonly length: number
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
    clear(): void
    key(index: number): string | null
  }

  export interface URL {
    href: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
    origin: string
    username: string
    password: string
    toString(): string
    toJSON(): string
  }

  export interface URLSearchParams {
    append(name: string, value: string): void
    delete(name: string): void
    get(name: string): string | null
    getAll(name: string): string[]
    has(name: string): boolean
    set(name: string, value: string): void
    sort(): void
    toString(): string
    forEach(callback: (value: string, name: string, searchParams: URLSearchParams) => void): void
  }

  export interface TextEncoder {
    encode(input?: string): Uint8Array
    encodeInto(source: string, destination: Uint8Array): { read: number; written: number }
    readonly encoding: string
  }

  export interface TextDecoder {
    decode(input?: BufferSource | Blob, options?: { stream?: boolean }): string
    readonly encoding: string
    readonly fatal: boolean
    readonly ignoreBOM: boolean
  }

  export class AbortController {
    signal: AbortSignal
    abort(reason?: any): void
  }

  export interface AbortSignal extends EventTarget {
    aborted: boolean
    reason: any
  }

  export interface Headers extends Iterable<[string, string]> {
    append(name: string, value: string): void
    delete(name: string): void
    get(name: string): string | null
    has(name: string): boolean
    set(name: string, value: string): void
    forEach(callback: (value: string, name: string, headers: Headers) => void): void
  }

  export interface Request {
    readonly url: string
    readonly method: string
    readonly headers: Headers
    readonly body: BodyInit | null
    readonly mode: RequestMode
    readonly credentials: RequestCredentials
    readonly cache: RequestCache
    redirect: RequestRedirect
  }

  export interface Response extends Body {
    readonly url: string
    readonly status: number
    readonly statusText: string
    readonly headers: Headers
    readonly ok: boolean
    readonly redirected: boolean
    readonly type: ResponseType
    readonly body: ReadableStream | null
    clone(): Response
  }

  export interface Body {
    readonly body: ReadableStream | null
    readonly bodyUsed: boolean
    arrayBuffer(): Promise<ArrayBuffer>
    blob(): Promise<Blob>
    formData(): Promise<FormData>
    json(): Promise<any>
    text(): Promise<string>
  }

  export interface ReadableStream<R = any> {
    readonly locked: boolean
    cancel(reason?: any): Promise<void>
    getReader(): ReadableStreamDefaultReader<R>
    pipeThrough<T>(
      transform: ReadableStreamTransformStream<R, T>,
      options?: StreamPipeOptions,
    ): ReadableStream<T>
    pipeTo<W>(destination: WritableStream<W>, options?: StreamPipeOptions): Promise<W>
    getIterator(): ReadableStreamIterator<R>
  }

  export interface WritableStream<W = any> {
    readonly locked: boolean
    abort(reason?: any): Promise<void>
    close(): Promise<void>
    getWriter(): WritableStreamDefaultWriter<W>
  }

  export interface TransformStream<I = any, O = any> {
    readonly readable: ReadableStream<O>
    readonly writable: WritableStream<I>
  }

  export interface MutationObserver {
    observe(target: Node, options?: MutationObserverInit): void
    disconnect(): void
    takeRecords(): MutationRecord[]
  }

  export interface MutationObserverInit {
    childList?: boolean
    attributes?: boolean
    characterData?: boolean
    subtree?: boolean
    attributeOldValue?: boolean
    characterDataOldValue?: boolean
    attributeFilter?: string[]
  }

  export interface MutationRecord {
    readonly type: MutationRecordType
    readonly target: Node
    readonly addedNodes: NodeList
    readonly removedNodes: NodeList
    readonly previousSibling: Node | null
    readonly nextSibling: Node | null
    readonly attributeName: string | null
    readonly attributeNamespace: string | null
    readonly oldValue: string | null
  }

  export interface NodeList extends Iterable<Node> {
    readonly length: number
    item(index: number): Node | null
    [index: number]: Node
  }

  export interface IntersectionObserver {
    observe(target: Element): void
    unobserve(target: Element): void
    disconnect(): void
    takeRecords(): IntersectionObserverEntry[]
  }

  export interface IntersectionObserverEntry {
    readonly boundingClientRect: DOMRect
    readonly intersectionRatio: number
    readonly intersectionRect: DOMRect
    readonly isIntersecting: boolean
    readonly rootBounds: DOMRect | null
    readonly target: Element
    readonly time: number
  }

  export interface ResizeObserver {
    observe(target: Element): void
    unobserve(target: Element): void
    disconnect(): void
  }

  export interface PerformanceObserver {
    observe(options: PerformanceObserverInit): void
    disconnect(): void
    takeRecords(): PerformanceEntryList
  }

  export interface WebSocket extends EventTarget {
    readonly url: string
    readonly readyState: number
    readonly bufferedAmount: number
    readonly extensions: string
    readonly protocol: string
    binaryType: string
    close(code?: number, reason?: string): void
    send(data: string | ArrayBuffer | Blob): void
    onopen: ((this: WebSocket, ev: Event) => any) | null
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null
    onerror: ((this: WebSocket, ev: Event) => any) | null
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null
  }

  export interface MessageEvent extends Event {
    readonly data: any
    readonly origin: string
    readonly lastEventId: string
    readonly source: MessageEventSource | null
  }

  export interface CloseEvent extends Event {
    readonly code: number
    readonly reason: string
    readonly wasClean: boolean
  }

  export interface DOMParser {
    parseFromString(string: string, type: DOMParserSupportedType): Document
  }

  export interface XMLSerializer {
    serializeToString(node: Node): string
  }

  export interface CustomElementRegistry {
    define(
      name: string,
      constructor: CustomElementConstructor,
      options?: ElementDefinitionOptions,
    ): void
    get(name: string): CustomElementConstructor | undefined
    whenDefined(name: string): Promise<CustomElementConstructor>
  }

  export interface CustomElementConstructor {
    new (): HTMLElement
  }

  export interface ElementDefinitionOptions {
    extends: string
  }

  export interface MediaStream extends EventTarget {
    readonly id: string
    readonly active: boolean
    addTrack(track: MediaStreamTrack): void
    removeTrack(track: MediaStreamTrack): void
    getAudioTracks(): MediaStreamTrack[]
    getVideoTracks(): MediaStreamTrack[]
    getTracks(): MediaStreamTrack[]
    clone(): MediaStream
  }

  export interface MediaStreamTrack extends EventTarget {
    readonly id: string
    readonly kind: string
    readonly label: string
    readonly enabled: boolean
    readonly readyState: number
    stop(): void
    clone(): MediaStreamTrack
  }

  export interface Audio extends HTMLElement {
    src: string
    crossOrigin: string
    play(): Promise<void>
    pause(): void
    load(): void
    readonly duration: number
    readonly currentTime: number
    readonly paused: boolean
    volume: number
    muted: boolean
    autoplay: boolean
    loop: boolean
    onended: ((this: Audio, ev: Event) => any) | null
    onerror: ((this: Audio, ev: Event) => any) | null
  }

  export interface XMLHttpRequest extends EventTarget {
    readonly readyState: number
    readonly status: number
    readonly statusText: string
    readonly response: any
    readonly responseText: string
    readonly responseType: XMLHttpRequestResponseType
    responseURL: string
    responseXML: Document | null
    timeout: number
    withCredentials: boolean
    abort(): void
    getAllResponseHeaders(): string
    getResponseHeader(name: string): string | null
    open(method: string, url: string, async?: boolean, user?: string, password?: string): void
    send(data?: any): void
    setRequestHeader(name: string, value: string): void
    onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null
    onload: ((this: XMLHttpRequest, ev: Event) => any) | null
    onerror: ((this: XMLHttpRequest, ev: Event) => any) | null
    onabort: ((this: XMLHttpRequest, ev: Event) => any) | null
    ontimeout: ((this: XMLHttpRequest, ev: Event) => any) | null
  }

  export interface ProgressEvent extends Event {
    readonly lengthComputable: boolean
    readonly loaded: number
    readonly total: number
  }

  export interface DOMException {
    name: string
    message: string
    code: number
  }

  export interface Navigator {
    userAgent: string
    language: string
    languages: string[]
    platform: string
    onLine: boolean
    hardwareConcurrency: number
  }

  export interface Location {
    href: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
    origin: string
    assign(url: string): void
    replace(url: string): void
    reload(force?: boolean): void
  }

  export interface History {
    readonly length: number
    state: any
    pushState(data: any, title: string, url?: string | null): void
    replaceState(data: any, title: string, url?: string | null): void
    go(delta?: number): void
    back(): void
    forward(): void
  }

  // Named exports for all HTML element constructors
  export const Window: { new (): Window }
  export const Document: { new (): Document }
  export const HTMLElement: { new (): HTMLElement }
  export const HTMLImageElement: { new (): HTMLImageElement }
  export const HTMLCanvasElement: { new (): HTMLCanvasElement }
  export const HTMLCollection: { new (): HTMLCollection }
  export const Element: { new (): Element }
  export const Node: { new (): Node }
  export const DocumentFragment: { new (): DocumentFragment }
  export const Comment: { new (): Comment }
  export const Text: { new (): Text }
  export const SVGElement: { new (): SVGElement }
  export const SVGSVGElement: { new (): SVGSVGElement }
  export const Event: { new (type: string, options?: EventInit): Event }
  export const MouseEvent: { new (type: string, options?: MouseEventInit): MouseEvent }
  export const UIEvent: { new (type: string, options?: UIEventInit): UIEvent }
  export const KeyboardEvent: { new (type: string, options?: KeyboardEventInit): KeyboardEvent }
  export const InputEvent: { new (type: string, options?: InputEventInit): InputEvent }
  export const TouchEvent: { new (type: string, options?: TouchEventInit): TouchEvent }
  export const PointerEvent: { new (type: string, options?: PointerEventInit): PointerEvent }
  export const CustomEvent: { new (type: string, options?: CustomEventInit): CustomEvent }
  export const FormData: { new (): FormData }
  export const File: { new (parts: BlobPart[], name: string, options?: FilePropertyBag): File }
  export const FileList: { new (): FileList }
  export const Blob: { new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob }
  export const FileReader: { new (): FileReader }
  export const Storage: { new (): Storage }
  export const URL: { new (url: string, base?: string | URL): URL }
  export const URLSearchParams: { new (init?: string | URLSearchParams): URLSearchParams }
  export const TextEncoder: { new (): TextEncoder }
  export const TextDecoder: { new (label?: string, options?: TextDecoderOptions): TextDecoder }
  export const AbortController: typeof AbortController
  export const AbortSignal: { new (): AbortSignal }
  export const Headers: { new (init?: HeadersInit): Headers }
  export const Request: { new (input: RequestInfo | URL, init?: RequestInit): Request }
  export const Response: { new (body?: BodyInit | null, init?: ResponseInit): Response }
  export const ReadableStream: { new (): ReadableStream }
  export const WritableStream: { new (): WritableStream }
  export const TransformStream: { new (): TransformStream }
  export const MutationObserver: { new (callback: MutationCallback): MutationObserver }
  export const IntersectionObserver: {
    new (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ): IntersectionObserver
  }
  export const ResizeObserver: { new (callback: ResizeObserverCallback): ResizeObserver }
  export const PerformanceObserver: {
    new (callback: PerformanceObserverCallback): PerformanceObserver
  }
  export const WebSocket: { new (url: string, protocols?: string | string[]): WebSocket }
  export const DOMParser: { new (): DOMParser }
  export const XMLSerializer: { new (): XMLSerializer }
  export const CustomElementRegistry: { new (): CustomElementRegistry }
  export const MediaStream: { new (tracks?: MediaStreamTrack[]): MediaStream }
  export const MediaStreamTrack: { new (): MediaStreamTrack }
  export const Audio: { new (): Audio }
  export const XMLHttpRequest: { new (): XMLHttpRequest }

  // Additional properties on Window that we use
  export const Node: { new (): Node }
  export const Element: { new (): Element }
  export const Document: { new (): Document }
  export const Event: { new (): Event }
  export const CustomEvent: { new (): CustomEvent }
  export const MouseEvent: { new (): MouseEvent }
  export const KeyboardEvent: { new (): KeyboardEvent }
  export const InputEvent: { new (): InputEvent }
  export const TouchEvent: { new (): TouchEvent }
  export const PointerEvent: { new (): PointerEvent }
  export const FormData: { new (): FormData }
  export const File: { new (): File }
  export const FileList: { new (): FileList }
  export const Blob: { new (): Blob }
  export const FileReader: { new (): FileReader }
  export const URL: { new (): URL }
  export const URLSearchParams: { new (): URLSearchParams }
  export const TextEncoder: { new (): TextEncoder }
  export const TextDecoder: { new (): TextDecoder }
  export const MutationObserver: { new (): MutationObserver }
  export const IntersectionObserver: { new (): IntersectionObserver }
  export const ResizeObserver: { new (): ResizeObserver }
  export const PerformanceObserver: { new (): PerformanceObserver }
  export const WebSocket: { new (): WebSocket }
  export const DOMParser: { new (): DOMParser }
  export const XMLSerializer: { new (): XMLSerializer }
  export const CustomElementRegistry: { new (): CustomElementRegistry }
  export const MessagePort: { new (): MessagePort }
  export const MessageEvent: { new (): MessageEvent }
  export const CloseEvent: { new (): CloseEvent }
  export const MediaStream: { new (): MediaStream }
  export const MediaStreamTrack: { new (): MediaStreamTrack }
  export const Audio: { new (): Audio }
  export const XMLHttpRequest: { new (): XMLHttpRequest }
  export const DOMException: { new (message?: string, name?: string): DOMException }
}

// Type definitions for options objects
interface EventInit {
  bubbles?: boolean
  cancelable?: boolean
  composed?: boolean
}

interface MouseEventInit extends EventInit {
  screenX?: number
  screenY?: number
  clientX?: number
  clientY?: number
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  button?: number
  buttons?: number
  relatedTarget?: EventTarget
}

interface UIEventInit extends EventInit {
  view?: any
  detail?: number
}

interface KeyboardEventInit extends EventInit {
  key?: string
  code?: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  repeat?: boolean
}

interface InputEventInit extends UIEventInit {
  data?: string | null
  inputType?: string
  isComposing?: boolean
}

interface TouchEventInit extends UIEventInit {
  touches?: TouchList
  targetTouches?: TouchList
  changedTouches?: TouchList
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

interface PointerEventInit extends MouseEventInit {
  pointerId?: number
  width?: number
  height?: number
  pressure?: number
  tangentialPressure?: number
  twist?: number
  pointerType?: string
  isPrimary?: boolean
}

interface CustomEventInit extends EventInit {
  detail?: any
}

interface DOMParserSupportedType {
  'text/html': 'text/html'
  'text/xml': 'text/xml'
  'application/xml': 'application/xml'
  'application/xhtml+xml': 'application/xhtml+xml'
  'image/svg+xml': 'image/svg+xml'
}

type DOMParserSupportedType =
  | 'text/html'
  | 'text/xml'
  | 'application/xml'
  | 'application/xhtml+xml'
  | 'image/svg+xml'

interface PerformanceObserverInit {
  entryTypes?: string[]
  buffered?: boolean
}

interface StreamPipeOptions {
  preventClose?: boolean
  preventAbort?: boolean
  preventCancel?: boolean
}

interface ResponseInit {
  status?: number
  statusText?: string
  headers?: HeadersInit
}

type HeadersInit = string[][] | Record<string, string> | Headers

interface RequestInit {
  method?: string
  headers?: HeadersInit
  body?: BodyInit | null
  mode?: RequestMode
  credentials?: RequestCredentials
  cache?: RequestCache
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  integrity?: string
  keepalive?: boolean
  signal?: AbortSignal | null
}

type RequestMode = 'navigate' | 'same-origin' | 'no-cors' | 'cors'
type RequestCredentials = 'omit' | 'same-origin' | 'include'
type RequestCache =
  | 'default'
  | 'no-store'
  | 'reload'
  | 'no-cache'
  | 'force-cache'
  | 'only-if-cached'
type RequestRedirect = 'follow' | 'error' | 'manual'

type BodyInit = Blob | ArrayBuffer | FormData | URLSearchParams | string

interface BlobPropertyBag {
  type?: string
  endings?: 'transparent' | 'native'
}

interface FilePropertyBag {
  type?: string
  lastModified?: number
}

interface TextDecoderOptions {
  fatal?: boolean
  ignoreBOM?: boolean
}

type XMLHttpRequestResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'

type MutationRecordType = 'attributes' | 'characterData' | 'childList'

type MessageEventSource = Window | MessagePort | ServiceWorker

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject

interface EventListener {
  (event: Event): void
}

interface EventListenerObject {
  handleEvent(event: Event): void
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean
  passive?: boolean
  signal?: AbortSignal
}

interface EventListenerOptions {
  capture?: boolean
}

interface MutationCallback {
  (mutations: MutationRecord[], observer: MutationObserver): void
}

interface IntersectionObserverCallback {
  (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void
}

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void
}

interface ResizeObserverEntry {
  readonly target: Element
  readonly contentRect: DOMRect
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>
}

interface ResizeObserverSize {
  inlineSize: number
  blockSize: number
}

interface PerformanceEntryList extends Array<PerformanceEntry> {}

interface PerformanceEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
}

interface PerformanceObserverCallback {
  (list: PerformanceObserverEntryList, observer: PerformanceObserver): void
}

interface ElementDefinitionOptions {
  extends?: string
}

// HTML Elements
interface HTMLAnchorElement extends HTMLElement {
  href: string
  download: string
  target: string
  rel: string
}

interface HTMLAreaElement extends HTMLElement {
  href: string
  alt: string
  coords: string
  shape: string
  target: string
}

interface HTMLAudioElement extends HTMLElement {
  src: string
  controls: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
  preload: string
}

interface HTMLBRElement extends HTMLElement {}

interface HTMLBaseElement extends HTMLElement {
  href: string
  target: string
}

interface HTMLBodyElement extends HTMLElement {}

interface HTMLButtonElement extends HTMLElement {
  type: string
  value: string
  disabled: boolean
  form: HTMLFormElement | null
}

interface HTMLCanvasElement extends HTMLElement {
  width: number
  height: number
  getContext(
    contextId: '2d' | 'webgl' | 'webgl2',
  ): CanvasRenderingContext2D | WebGLRenderingContext | null
  toDataURL(type?: string, quality?: number): string
}

interface HTMLDataElement extends HTMLElement {
  value: string
}

interface HTMLDataListElement extends HTMLElement {
  options: HTMLCollection
}

interface HTMLDetailsElement extends HTMLElement {
  open: boolean
}

interface HTMLDialogElement extends HTMLElement {
  open: boolean
  returnValue: string
  show(): void
  showModal(): void
  close(returnValue?: string): void
}

interface HTMLDivElement extends HTMLElement {}

interface HTMLEmbedElement extends HTMLElement {
  src: string
  type: string
}

interface HTMLFieldSetElement extends HTMLElement {
  disabled: boolean
  form: HTMLFormElement | null
  name: string
  type: string
}

interface HTMLFormElement extends HTMLElement {
  action: string
  method: string
  enctype: string
  target: string
  acceptCharset: string
  noValidate: boolean
}

interface HTMLHRElement extends HTMLElement {}

interface HTMLHeadElement extends HTMLElement {}

interface HTMLHeadingElement extends HTMLElement {}

interface HTMLIFrameElement extends HTMLElement {
  src: string
  name: string
  width: string
  height: string
  allow: string
}

interface HTMLInputElement extends HTMLElement {
  type: string
  value: string
  checked: boolean
  disabled: boolean
  readonly: boolean
  required: boolean
  placeholder: string
  form: HTMLFormElement | null
}

interface HTMLLabelElement extends HTMLElement {
  htmlFor: string
  form: HTMLFormElement | null
}

interface HTMLLegendElement extends HTMLElement {}

interface HTMLLinkElement extends HTMLElement {
  href: string
  rel: string
  type: string
  media: string
}

interface HTMLMapElement extends HTMLElement {
  name: string
}

interface HTMLMediaElement extends HTMLElement {
  src: string
  controls: boolean
  autoplay: boolean
  loop: boolean
  muted: boolean
  preload: string
  currentTime: number
  duration: number
  paused: boolean
  volume: number
}

interface HTMLMenuElement extends HTMLElement {}

interface HTMLMetaElement extends HTMLElement {
  name: string
  content: string
  httpEquiv: string
}

interface HTMLMeterElement extends HTMLElement {
  value: number
  min: number
  max: number
  low: number
  high: number
  optimum: number
}

interface HTMLModElement extends HTMLElement {
  cite: string
  dateTime: string
}

interface HTMLObjectElement extends HTMLElement {
  data: string
  type: string
  name: string
}

interface HTMLOptGroupElement extends HTMLElement {
  disabled: boolean
  label: string
}

interface HTMLOptionElement extends HTMLElement {
  value: string
  disabled: boolean
  label: string
  selected: boolean
  text: string
  index: number
}

interface HTMLOutputElement extends HTMLElement {
  defaultValue: string
  value: string
}

interface HTMLParagraphElement extends HTMLElement {}

interface HTMLParamElement extends HTMLElement {
  name: string
  value: string
}

interface HTMLPictureElement extends HTMLElement {}

interface HTMLPreElement extends HTMLElement {}

interface HTMLProgressElement extends HTMLElement {
  value: number
  max: number
}

interface HTMLQuoteElement extends HTMLElement {
  cite: string
}

interface HTMLScriptElement extends HTMLElement {
  src: string
  type: string
  charset: string
  defer: boolean
  async: boolean
}

interface HTMLSelectElement extends HTMLElement {
  value: string
  disabled: boolean
  multiple: boolean
  required: boolean
  length: number
  form: HTMLFormElement | null
  options: HTMLCollection
  selectedIndex: number
}

interface HTMLSourceElement extends HTMLElement {
  src: string
  type: string
  media: string
}

interface HTMLSpanElement extends HTMLElement {}

interface HTMLStyleElement extends HTMLElement {
  type: string
  media: string
}

interface HTMLTableCaptionElement extends HTMLElement {}

interface HTMLTableCellElement extends HTMLElement {
  colSpan: number
  rowSpan: number
  headers: string
}

interface HTMLTableColElement extends HTMLElement {
  span: number
}

interface HTMLTableElement extends HTMLElement {
  caption: HTMLTableCaptionElement | null
  tHead: HTMLTableSectionElement | null
  tFoot: HTMLTableSectionElement | null
  rows: HTMLCollection
}

interface HTMLTableRowElement extends HTMLElement {
  cells: HTMLCollection
  rowIndex: number
}

interface HTMLTableSectionElement extends HTMLElement {
  rows: HTMLCollection
}

interface HTMLTemplateElement extends HTMLElement {
  content: DocumentFragment
}

interface HTMLTextAreaElement extends HTMLElement {
  value: string
  disabled: boolean
  readonly: boolean
  required: boolean
  placeholder: string
  form: HTMLFormElement | null
  rows: number
  cols: number
}

interface HTMLTimeElement extends HTMLElement {
  dateTime: string
}

interface HTMLTitleElement extends HTMLElement {
  text: string
}

interface HTMLTrackElement extends HTMLElement {
  kind: string
  src: string
  srclang: string
  label: string
  default: boolean
}

interface HTMLUListElement extends HTMLElement {}

interface HTMLUnknownElement extends HTMLElement {}

interface HTMLVideoElement extends HTMLMediaElement {
  poster: string
  playsInline: boolean
  videoWidth: number
  videoHeight: number
}

interface HTMLDocument extends Document {}

// SVG Elements
interface SVGAElement extends SVGElement {}
interface SVGAltGlyphElement extends SVGElement {}
interface SVGAnimateElement extends SVGElement {}
interface SVGAnimateMotionElement extends SVGElement {}
interface SVGAnimateTransformElement extends SVGElement {}
interface SVGCircleElement extends SVGElement {}
interface SVGClipPathElement extends SVGElement {}
interface SVGComponentTransferFunctionElement extends SVGElement {}
interface SVGDefsElement extends SVGElement {}
interface SVGDescElement extends SVGElement {}
interface SVGElement extends Element {}
interface SVGEllipseElement extends SVGElement {}
interface SVGFeBlendElement extends SVGElement {}
interface SVGFeColorMatrixElement extends SVGElement {}
interface SVGFeComponentTransferElement extends SVGElement {}
interface SVGFeCompositeElement extends SVGElement {}
interface SVGFeConvolveMatrixElement extends SVGElement {}
interface SVGFeDiffuseLightingElement extends SVGElement {}
interface SVGFeDisplacementMapElement extends SVGElement {}
interface SVGFeDistantLightElement extends SVGElement {}
interface SVGFEFloodElement extends SVGElement {}
interface SVGFEFuncAElement extends SVGElement {}
interface SVGFEFuncBElement extends SVGElement {}
interface SVGFEFuncGElement extends SVGElement {}
interface SVGFEFuncRElement extends SVGElement {}
interface SVGFeGaussianBlurElement extends SVGElement {}
interface SVGFeImageElement extends SVGElement {}
interface SVGFeMergeElement extends SVGElement {}
interface SVGFeMergeNodeElement extends SVGElement {}
interface SVGFeMorphologyElement extends SVGElement {}
interface SVGFeOffsetElement extends SVGElement {}
interface SVGFeSpecularLightingElement extends SVGElement {}
interface SVGFeSpotLightElement extends SVGElement {}
interface SVGFeTileElement extends SVGElement {}
interface SVGFeTurbulenceElement extends SVGElement {}
interface SVGFilterElement extends SVGElement {}
interface SVGForeignObjectElement extends SVGElement {}
interface SVGGElement extends SVGElement {}
interface SVGImageElement extends SVGElement {}
interface SVGLineElement extends SVGElement {}
interface SVGLinearGradientElement extends SVGElement {}
interface SVGMarkerElement extends SVGElement {}
interface SVGMaskElement extends SVGElement {}
interface SVGMetadataElement extends SVGElement {}
interface SVGPathElement extends SVGElement {}
interface SVGPatternElement extends SVGElement {}
interface SVGPolygonElement extends SVGElement {}
interface SVGPolylineElement extends SVGElement {}
interface SVGRadialGradientElement extends SVGElement {}
interface SVGRectElement extends SVGElement {}
interface SVGScriptElement extends SVGElement {}
interface SVGSetElement extends SVGElement {}
interface SVGStopElement extends SVGElement {}
interface SVGStyleElement extends SVGElement {}
interface SVGSwitchElement extends SVGElement {}
interface SVGSymbolElement extends SVGElement {}
interface SVGTextContentElement extends SVGElement {}
interface SVGTextElement extends SVGElement {}
interface SVGTextPathElement extends SVGElement {}
interface SVGTitleElement extends SVGElement {}
interface SVGTransform extends SVGElement {}
interface SVGTSpanElement extends SVGElement {}
interface SVGUseElement extends SVGElement {}
interface SVGViewElement extends SVGElement {}
