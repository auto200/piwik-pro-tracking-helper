import { Message } from '@/lib/messaging';
import { browser } from 'wxt/browser';

export type Entry = Message & { id: string };

type Listener = () => void;
let messages: Entry[] = [];
let listeners: Listener[] = [];

const port = browser.runtime.connect({ name: 'devtools' });
let pageOrigin = '';
const trackingEndpoints: { _paq: string[]; _ppas: string[] } = { _paq: [], _ppas: [] };

port.onMessage.addListener(function (_msg) {
  const msg = _msg as Message;
  if (msg.source !== 'JSTC_DBG') return true;
  if (msg.type === 'PAGE_METADATA') {
    pageOrigin = msg.payload.origin;
    return true;
  }

  messages = [...messages, { ...msg, id: crypto.randomUUID() }];

  if (msg.type !== 'PAQ_ENTRY' && msg.type !== 'PPAS_ENTRY') return true;

  const [name, trackerUrl] = msg.payload.data;
  if (name !== 'setTrackerUrl') return true;
  if (typeof trackerUrl !== 'string') return true;

  let parsedUrl = '';

  if (trackerUrl.startsWith('//')) {
    parsedUrl = new URL(pageOrigin).protocol + trackerUrl;
  } else if (trackerUrl.startsWith('/')) {
    parsedUrl = pageOrigin + trackerUrl;
  } else if (trackerUrl.startsWith('http')) {
    parsedUrl = trackerUrl;
  } else {
    parsedUrl = new URL(pageOrigin).origin + '/' + trackerUrl;
  }

  if (!parsedUrl) return true;

  if (msg.type === 'PAQ_ENTRY') {
    if (!trackingEndpoints._paq.includes(parsedUrl)) {
      trackingEndpoints._paq.push(parsedUrl);
    }
  } else {
    if (!trackingEndpoints._ppas.includes(parsedUrl)) {
      trackingEndpoints._ppas.push(parsedUrl);
    }
  }
  emitChange();
  return true;
});

browser.devtools.network.onRequestFinished.addListener((request: any) => {
  let msg: Message | undefined;

  if (trackingEndpoints._paq.includes(request.request.url)) {
    msg = getMessage(request, 'PAQ_NETWORK_EVENT');
  }
  if (trackingEndpoints._ppas.includes(request.request.url)) {
    msg = getMessage(request, 'PPAS_NETWORK_EVENT');
  }

  if (!msg) return;
  messages = [...messages, { ...msg, id: crypto.randomUUID() }];
  emitChange();
});

export const eventStore = {
  subscribe: (listener: Listener) => {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot: () => {
    return messages;
  },
  clear: () => {
    messages = [];
    pageOrigin = '';
    emitChange();
  },
};

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getMessage(
  request: any,
  eventType: 'PAQ_NETWORK_EVENT' | 'PPAS_NETWORK_EVENT'
): Message | undefined {
  const isBatchRequest = request.request.postData?.text.startsWith('{"requests":[');

  if (eventType === 'PAQ_NETWORK_EVENT') {
    if (isBatchRequest) {
      return {
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
      return {
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

  if (eventType === 'PPAS_NETWORK_EVENT') {
    if (isBatchRequest) {
      return {
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
      return {
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

  return undefined;
}
