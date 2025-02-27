import { Message } from '@/lib/messaging';
import { browser, Runtime } from 'wxt/browser';

browser.devtools.panels.create('Piwik PRO JSTC Debugger', 'icon/128.png', 'devtools-panel.html');

let port: Runtime.Port | undefined;
const queue: Message[] = [];

function postMessage(msg: Message) {
  port?.postMessage(msg);
}

browser.runtime.onConnect.addListener((p) => {
  port = p;
  if (queue.length) {
    queue.forEach((msg) => {
      postMessage(msg);
    });
  }
  queue.length = 0;
});

browser.devtools.network.onRequestFinished.addListener((request: any) => {
  if (request.request.url.endsWith('ppms.php')) {
    const msg: Message = {
      source: 'JSTC_DBG',
      type: 'NETWORK_EVENT',
      payload: { url: request.request.url, params: request.request.postData.params },
    };
    if (port) {
      postMessage(msg);
    } else {
      queue.push(msg);
    }
  }
});
