import { sendMessageToContent } from '../../../lib/ipc';

export async function callServiceWorker<T = any>(
  method: string,
  ...args: any[]
) {
  return sendMessageToContent<T>({
    type: 'callService',
    payload: {
      method: method,
      args: args,
    },
  });
}

export async function exec<T = any>(sql: string, options?: any) {
  return callServiceWorker<T>('exec', sql, {
    rowMode: 'object',
    ...options,
  });
}
