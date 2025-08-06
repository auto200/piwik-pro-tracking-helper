import { defineBackground, browser } from '#imports';
import { onMessage } from 'webext-bridge/background';

export default defineBackground(() => {
  // browser.tabs seems to be not available in devtools panel in firefox
  onMessage('RELOAD', () => {
    return browser.tabs.reload();
  });
});
