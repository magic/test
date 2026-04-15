import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'
export declare const define: (
  target: Record<string | symbol, unknown>,
  key: string | symbol,
  value: unknown,
) => void
export declare const initGlobals: () => {
  window: HappyWindow
  document: HappyDocument
}
