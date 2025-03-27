import { log } from '../../lib/log';

log('Service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  log('Service worker installed');
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   log('Tab updated:', tabId, changeInfo, tab);
// });
