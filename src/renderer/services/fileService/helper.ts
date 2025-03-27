import { sendMessageToContent } from '../../../lib/ipc';
import { byteToReadableStr } from '../../../lib/sundry';

export async function callContentScriptOpfs(
  method: string,
  ...args: any[]
): Promise<any> {
  return sendMessageToContent({
    type: 'callOpfs',
    payload: { method, args },
  });
}

export async function getOpfsUsage() {
  const { quota = 1, usage = 1 } = await navigator.storage.estimate();

  const percent = Math.floor((usage / quota) * 10000) / 100;

  return {
    quotaStr: byteToReadableStr(quota!),
    usageStr: byteToReadableStr(usage!),
    quota,
    usage,
    percent,
  };
}
