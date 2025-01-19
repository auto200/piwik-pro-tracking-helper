import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    console.log('forwarder initialized');
    window.addEventListener('message', (ev) => {
      if (ev.data.type === 'FROM_CONTENT_SCRIPT') {
        console.log('[forwarder]: forwarding message to background script', ev);
        browser.runtime.sendMessage(ev.data);
      }
    });
  },
});
