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

  const isBatchRequest = request.request.postData?.text.startsWith('{"requests":[');

  if (request.request.url.endsWith('ppms.php')) {
    if (isBatchRequest) {
      console.log(JSON.parse(request.request.postData?.text).requests);
      msg = {
        source: 'JSTC_DBG',
        type: 'PAQ_NETWORK_EVENT',
        payload: {
          type: 'BATCH',
          url: request.request.url,
          requestsParams: (JSON.parse(request.request.postData?.text).requests as string[]).map(
            (r) => [...new URLSearchParams(r).entries()].map(([name, value]) => ({ name, value }))
          ),
        },
      };
    } else {
      msg = {
        source: 'JSTC_DBG',
        type: 'PAQ_NETWORK_EVENT',
        payload: {
          type: 'SINGLE',
          url: request.request.url,
          params: request.request.postData?.params ?? [],
        },
      };
    }
  }

  if (request.request.url.endsWith('piwik.php')) {
    if (isBatchRequest) {
      msg = {
        source: 'JSTC_DBG',
        type: 'PPAS_NETWORK_EVENT',
        payload: {
          type: 'BATCH',
          url: request.request.url,
          requestsParams: (JSON.parse(request.request.postData?.text).requests as string[]).map(
            (r) => [...new URLSearchParams(r).entries()].map(([name, value]) => ({ name, value }))
          ),
        },
      };
    } else {
      msg = {
        source: 'JSTC_DBG',
        type: 'PPAS_NETWORK_EVENT',
        payload: {
          type: 'SINGLE',
          url: request.request.url,
          params: request.request.postData?.params ?? [],
        },
      };
    }
  }

  if (!msg) return;

  if (port) {
    postMessage(msg);
  } else {
    queue.push(msg);
  }
});
