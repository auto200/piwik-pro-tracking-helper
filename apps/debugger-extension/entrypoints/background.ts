import { Message } from '@/lib/messaging';
import { browser, Runtime } from 'wxt/browser';
import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('background script initialized');
  let devToolsPort: Runtime.Port | undefined;
  // from forwarder
  // @ts-expect-error lol
  browser.runtime.onMessage.addListener((request: Message | undefined) => {
    if (request?.source !== 'JSTC_DBG') return false;
    if (!devToolsPort) {
      return false;
    }
    if (devToolsPort.error) {
      console.log(devToolsPort.error);
      return false;
    }
    devToolsPort.postMessage(request);
    return false;
  });

  // to devtools panel
  browser.runtime.onConnect.addListener((port) => {
    console.assert(port.name === 'devtools');
    devToolsPort = port;

    devToolsPort.onDisconnect.addListener(() => {
      devToolsPort = undefined;
    });
  });
});
