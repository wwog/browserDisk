chrome.runtime.onConnect.addListener((port) => {
  const messageHandler = (message: any, port: chrome.runtime.Port) => {};
  const handleUpdated = () => {
    port.postMessage({
      type: 'tabs_onUpdate',
    });
  };
  port.onMessage.addListener(messageHandler);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(messageHandler);
    chrome.tabs.onUpdated.removeListener(handleUpdated);
  });

  chrome.tabs.onUpdated.addListener(handleUpdated);
});

const getCurrentId = () => {
  return new Promise<number>((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!tabs[0]?.id) {
        reject(new Error('No active tab found'));
      } else {
        resolve(tabs[0].id);
      }
    });
  });
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
        const res = await globalThis.$sql_view_exec(sql, option);
        console.log('exec', {
          sql,
          bind: option,
          res,
        });
        return res;
      },
      args: [sql, option],
      world: 'MAIN',
    });
    return res[0]?.result;
  },
};

async function handleCallServiceWorker(
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
  sendResponse(resPayload);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('serviceWorker received message:', message, sender);
  handleCallServiceWorker(message.payload, sendResponse);
  return true;
});
