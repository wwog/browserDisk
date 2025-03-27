export function log(...args: any[]) {
  console.log('[Browser Extension]', ...args);
}
export function warn(...args: any[]) {
  console.warn('[Browser Extension]', ...args);
}
export function error(...args: any[]) {
  console.error('[Browser Extension]', ...args);
}
