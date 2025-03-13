import { Message } from '@/lib/messaging';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    window.addEventListener('message', (ev: MessageEvent<Message>) => {
      if (ev.data.source === 'JSTC_DBG') {
        try {
          browser.runtime.sendMessage(ev.data);
        } catch (e) {
          console.log(e);
        }
      }
    });
  },
});
