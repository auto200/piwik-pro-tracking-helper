import { Message } from '@/lib/messaging';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    window.addEventListener('message', (ev: MessageEvent<Message>) => {
      if (ev.data.type === 'FROM_CONTENT_SCRIPT') {
        browser.runtime.sendMessage(ev.data);
      }
    });
  },
});
