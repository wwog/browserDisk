import { log } from '../../lib/log';

log('Service worker loaded');
chrome.runtime.onConnect.addListener((port) => {
  const messageHandler = (message: any, port: chrome.runtime.Port) => {};
  port.onMessage.addListener(messageHandler);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(messageHandler);
  });

  chrome.tabs.onUpdated.addListener(() => {
    port.postMessage({
      type: 'tabs_onUpdate',
    });
  });
});

const getCurrentId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id!;
};

const methods = {
  checkConnection: async () => {
    const tabId = await getCurrentId();
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return (
          //@ts-ignore
          globalThis.$sql_view_exec !== undefined &&
          //@ts-ignore
          typeof globalThis.$sql_view_exec === 'function'
        );
      },
      world: 'MAIN',
    });
    return res[0]?.result;
  },
  exec: async (sql: string, option: any) => {
    const tabId = await getCurrentId();
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (sql: string, option: any) => {
        //@ts-ignore
        return await globalThis.$sql_view_exec(sql, option);
      },
      args: [sql, option],
      world: 'MAIN',
    });
    if (res[0]?.result?.error) {
      throw new Error(res[0].result.error);
    }
    return res[0]?.result?.result;
  },
};

async function handleCallServiceWorker(
  payload: { method: string; args: any[] },
  sendResponse: (response?: any) => void
) {
  const method = payload.method;
  const args = payload.args;
  console.log('handleCallServiceWorker', method, args);
  const resPayload: {
    result: any | null;
    error: string | null;
  } = {
    result: null,
    error: null,
  };
  try {
    if (method in methods) {
      const _res = await (methods as any)[method](...args);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('serviceWorker received message:', message, sender);
  handleCallServiceWorker(message.payload, sendResponse);
  return true;
});
