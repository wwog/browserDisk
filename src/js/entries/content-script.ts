import { log } from '../../lib/log';
import * as OpfsMethods from '@happy-js/happy-opfs';
import { resolve } from '../../lib/opfsPath';

log('Content script loaded');
export interface FileSystemItem {
  name: string;
  kind: 'directory' | 'file' | 'dbFile';
  url?: string;
  subname?: string;
}

async function handleCallOpfs(
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
    if (method in OpfsMethods) {
      const _callRes = await (OpfsMethods as any)[method](...args);
      const result = _callRes.unwrap();
      switch (method) {
        case 'readDir':
          {
            const items: FileSystemItem[] = [];
            for await (const element of result) {
              const item: FileSystemItem = {
                name: element.handle.name,
                kind: element.handle.kind,
              };
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

            resPayload.result = items;
          }
          break;
        default:
          resPayload.result = result;
      }
    } else {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('Content script received message:', request, sender);
  const response: {
    result: any | null;
    error: string | null;
  } = {
    result: null,
    error: null,
  };
  switch (request.type) {
    case 'callOpfs':
      handleCallOpfs(request.payload, sendResponse);
      break;
    default:
      response.error = `Unknown request type: ${request.type}`;
      sendResponse(response);
      return;
  }
  return true; // Keep the message channel open for sendResponse
});
