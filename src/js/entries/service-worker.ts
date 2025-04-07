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
