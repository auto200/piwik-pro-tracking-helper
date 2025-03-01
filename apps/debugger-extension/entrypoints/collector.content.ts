import { defineContentScript } from 'wxt/sandbox';
import { Message } from '@/lib/messaging';

// proxy object created when JSTC is loaded
type _PaqProxy = { push: (args: unknown[]) => void };

function is_paqProxy(value: unknown): value is _PaqProxy {
  return typeof value === 'object' && value !== null && 'push' in value;
}

const sendMessage = (msg: Message) => {
  window.postMessage(msg, '*');
};

export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    let internal_paq: undefined | unknown[] | _PaqProxy;

    Object.defineProperty(window, '_paq', {
      configurable: true,
      enumerable: true,

      set: function (value) {
        // ignore reassignment `_paq = _paq || []`
        if (internal_paq === value) {
          return;
        }
        // initialization `_paq = []`
        if (Array.isArray(value)) {
          internal_paq = value;
          return;
        }

        if (is_paqProxy(value)) {
          const message: Message = { type: 'JSTC_LOADED', source: 'JSTC_DBG' };

          sendMessage(message);
          internal_paq = value;
          const originalPush = value.push;
          value.push = (args) => {
            const message: Message = {
              type: 'PAQ_ENTRY',
              source: 'JSTC_DBG',
              payload: {
                data: args.map((e) => (typeof e === 'function' ? e.toString() : e)) as any,
              },
            };

            sendMessage(message);
            originalPush(args);
          };
          return;
        }
        console.log('some bogus amogus value:', value);

        internal_paq = value;
      },
      get: function () {
        return internal_paq;
      },
    });

    let internalPiwik: undefined | Record<string, unknown>;
    // JSTC initialization
    Object.defineProperty(window, 'Piwik', {
      configurable: true,
      enumerable: true,

      // First thing that JSTC does after loading is setting global Piwik object,
      // when that object is defined we are sure that JSTC has loaded
      set: function (value) {
        // console.log('set called', new Error()); // interesting way to see what caused the push
        if (Array.isArray(internal_paq)) {
          // TODO: send message that JSTC has been initialized
          internal_paq.forEach((p) => {
            const message: Message = {
              source: 'JSTC_DBG',
              type: 'PAQ_ENTRY',
              payload: { data: p as any },
            };
            sendMessage(message);
          });
        }
        internalPiwik = value;
      },
      get: function () {
        return internalPiwik;
      },
    });
  },
});
