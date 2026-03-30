export function handleResponse(
  res: import('http').IncomingMessage,
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
  url?: string,
  maxSize?: number,
): void
export type HttpError = Error & {
  statusCode?: number
}
//# sourceMappingURL=handleResponse.d.ts.map
