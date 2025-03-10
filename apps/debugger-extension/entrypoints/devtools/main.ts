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
  let msg: Message | undefined;

  if (request.request.url.endsWith('ppms.php')) {
    msg = {
      source: 'JSTC_DBG',
      type: 'PAQ_NETWORK_EVENT',
      payload: { url: request.request.url, params: request.request.postData?.params ?? [] },
    };
  }

  if (request.request.url.endsWith('piwik.php')) {
    msg = {
      source: 'JSTC_DBG',
      type: 'PPAS_NETWORK_EVENT',
      payload: { url: request.request.url, params: request.request.postData?.params ?? [] },
    };
  }

  if (!msg) return;

  if (port) {
    postMessage(msg);
  } else {
    queue.push(msg);
  }
});
