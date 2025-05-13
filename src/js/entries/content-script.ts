import {
  exists,
  isFileHandle,
  mkdir,
  readDir,
  readTextFile,
  remove,
  stat,
  writeFile,
} from '@happy-js/happy-opfs';
import { saveToDisk } from '../utils/saveToDisk';
import { extname, resolve } from '../../lib/opfsPath';
import { ImageExt } from '../../lib/const';
import { decodeSAHPoolFilename, SAHPoolDirName } from '../utils/sqliteSAHPool';
import { PromiseWithResolvers } from '../../lib/sundry';

export interface FileSystemItem {
  name: string;
  kind: 'directory' | 'file' | 'dbFile';
  path: string;
  url?: string;
  subname?: string;
}

const contentMethods = {
  readDir: async (dirpath: string) => {
    const items: FileSystemItem[] = [];
    const _res = (await readDir(dirpath)).unwrap();
    for await (const element of _res) {
      const item: FileSystemItem = {
        name: element.handle.name,
        kind: element.handle.kind,
        path: resolve(dirpath, element.handle.name),
      };
      if (isFileHandle(element.handle)) {
        const ext = extname(element.handle.name);
        if (ImageExt.includes(ext)) {
          item.url = URL.createObjectURL(await element.handle.getFile());
        } else if (dirpath.endsWith(SAHPoolDirName)) {
          const file = await element.handle.getFile();
          const filename = await decodeSAHPoolFilename(file);
          if (filename) {
            item.kind = 'dbFile';
            item.subname = filename;
          }
        }
      }
      items.push(item);
    }
    items.sort((a, b) => {
      if (a.kind === 'directory' && b.kind === 'file') {
        return -1;
      }
      if (a.kind === 'file' && b.kind === 'directory') {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return items;
  },
  mkdir: async (path: string) => {
    const _res = await mkdir(path);
    return _res.unwrap();
  },
  writeTextFileByString: async (
    path: string,
    content: string,
    options?: any
  ) => {
    const _res = await writeFile(path, content, options);
    return _res.unwrap();
  },
  writeFileByArray: async (
    path: string,
    data: Array<number>,
    options?: any
  ) => {
    const uint8Array = new Uint8Array(data);
    const _res = await writeFile(path, uint8Array, options);
    return _res.unwrap();
  },
  saveToDisk: async (paths: string[]) => {
    console.log('paths', paths);
    const items = await Promise.all(
      paths.map(async (path) => {
        const res = await stat(path);
        return {
          handle: res.unwrap(),
          path,
        };
      })
    );
    //@ts-ignore
    const diskHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'downloads',
    });

    await saveToDisk(diskHandle, items);
  },
  exists: async (path: string) => {
    const res = await exists(path);
    return res.unwrap();
  },
  createFile: async (path: string) => {
    const existed = (await exists(path)).unwrap();
    if (!existed) {
      const _res = await writeFile(path, new Blob(), { create: true });
      return _res.unwrap();
    }
    throw new Error('File already exists');
  },
  remove: async (path: string) => {
    const res = await remove(path);
    return res.unwrap();
  },
  readTextFile: async (path: string) => {
    const res = await readTextFile(path);
    return res.unwrap();
  }
};

async function callService(method: string, ...args: any[]) {
  const { promise, reject, resolve } = PromiseWithResolvers();
  chrome.runtime.sendMessage(
    {
      type: 'callOpfs',
      payload: {
        method,
        args,
      },
    },
    (res) => {
      if (res.error) {
        reject(res.error);
      } else {
        resolve(res.result);
      }
    }
  );
  return promise;
}

async function handleCallContentMethods(
  payload: { method: string; args: any[] },
  sendResponse: (response?: any) => void
) {
  const method = payload.method;
  const args = payload.args;
  const resPayload: {
    result: any | null;
    error: string | null;
  } = {
    result: null,
    error: null,
  };
  try {
    if (method in contentMethods) {
      const _res = await (contentMethods as any)[method](...args);
      resPayload.result = _res;
    } else {
      console.error(`Method ${method} not found`, method === 'writeFileStream');
      throw new Error(`Method ${method} not found`);
    }
  } catch (error) {
    if (error instanceof Error) {
      resPayload.error = error.message;
    } else {
      resPayload.error = String(error);
    }
  }
  sendResponse(resPayload);
}

const serviceMethods = {
  checkConnection: () => callService('checkConnection'),
  exec: (sql: string, option: any) => callService('exec', sql, option),
};

async function handleCallService(
  payload: { method: string; args: any[] },
  sendResponse: (response?: any) => void
) {
  const method = payload.method;
  const args = payload.args;
  const resPayload: {
    result: any | null;
    error: string | null;
  } = {
    result: null,
    error: null,
  };
  try {
    if (method in serviceMethods) {
      const methodFunc = (serviceMethods as any)[method];
      const _res = await methodFunc(...args);
      resPayload.result = _res;
    } else {
      console.error(`Method ${method} not found`, method === 'writeFileStream');
      throw new Error(`Method ${method} not found`);
    }
  } catch (error) {
    if (error instanceof Error) {
      resPayload.error = error.message;
    } else {
      resPayload.error = String(error);
    }
  }
  console.log('callOpfs response', resPayload);
  sendResponse(resPayload);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received message:', request);
  const response: {
    result: any | null;
    error: string | null;
  } = {
    result: null,
    error: null,
  };
  switch (request.type) {
    case 'callCS':
      handleCallContentMethods(request.payload, sendResponse);
      break;
    case 'callService':
      handleCallService(request.payload, sendResponse);
      break;
    default:
      response.error = `Unknown request type: ${request.type}`;
      sendResponse(response);
      return;
  }
  return true; // Keep the message channel open for sendResponse
});
