import { log } from '../../lib/log';

log('Service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  log('Service worker installed');
});
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg, port) => {
    log('Service worker received message:', msg, port);
  });
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   log('Tab updated:', tabId, changeInfo, tab);
// });
