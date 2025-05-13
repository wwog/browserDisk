import { sendMessageToContent } from '../../../lib/ipc';
import { resolve } from '../../../lib/opfsPath';
import {
  byteToReadableStr,
  isDirectoryHandle,
  isFileHandle,
} from '../../../lib/sundry';

export async function callContentScript(
  method: string,
  ...args: any[]
): Promise<any> {
  return sendMessageToContent({
    type: 'callCS',
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

export async function saveToOpfs(
  targetPath: string,
  fsHandles: FileSystemHandle[]
) {
  for (const fsHandle of fsHandles) {
    const handleTargetPath = resolve(targetPath, fsHandle.name);
    if (isDirectoryHandle(fsHandle)) {
      await callContentScript('mkdir', handleTargetPath);
      const fsHandles = [];
      //@ts-ignore
      for await (const [name, handle] of fsHandle.entries()) {
        fsHandles.push(handle);
      }
      await saveToOpfs(handleTargetPath, fsHandles);
    } else if (isFileHandle(fsHandle)) {
      const file = await fsHandle.getFile();
      const data = new Uint8Array(await file.arrayBuffer());
      await callContentScript('writeFileByArray', handleTargetPath, [...data], {
        create: true,
      });
    } else {
      console.error('Unsupported handle type');
    }
  }
}
