import { sendMessageToContent } from '../../../lib/ipc';

export async function callContentScriptSqlMethod<T = any>(
  method: string,
  ...args: any[]
) {
  return sendMessageToContent<T>({
    type: 'sqlite_view',
    payload: {
      method: method,
      args: args,
    },
  });
}

export async function exec<T = any>(sql: string, options?: any) {
  return callContentScriptSqlMethod<T>('exec', sql, {
    rowMode: 'object',
    ...options,
  });
}
