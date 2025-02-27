import { Message } from '@/lib/messaging';
import { browser, Runtime } from 'wxt/browser';
import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('background script initialized');
  let devToolsPort: Runtime.Port | undefined;
  const queue: unknown[] = [];
  // from forwarder
  // @ts-expect-error lol
  browser.runtime.onMessage.addListener((request: Message | undefined): undefined => {
    if (request?.source !== 'JSTC_DBG') return;
    console.log('[background]: message received:', request);
    if (!devToolsPort) {
      console.log('[background]: adding to queue');
      queue.push(request);
      return;
    }
    console.log('[background]: positing message');
    devToolsPort.postMessage(request);
    // You can handle messages here if needed
  });

  // to devtools panel
  browser.runtime.onConnect.addListener((port) => {
    console.log('[background]: port established', port);
    console.assert(port.name === 'devtools');
    devToolsPort = port;

    if (queue.length > 0) {
      console.log('[background]: draining queue');
      queue.forEach((r) => port.postMessage(r));
      queue.length = 0;
    }
  });
});
