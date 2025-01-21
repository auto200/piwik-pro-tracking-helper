import { defineContentScript } from 'wxt/sandbox';

// proxy object created when JSTC is loaded
type _PaqProxy = { push: (args: unknown[]) => void };

function is_paqProxy(value: unknown): value is _PaqProxy {
  return typeof value === 'object' && value !== null && 'push' in value;
}

const sendMessage = (args: any) => {
  window.postMessage(
    // { type: "FROM_CONTENT_SCRIPT", data: JSON.stringify(args) },
    { type: 'FROM_CONTENT_SCRIPT', data: args },
    '*'
  );
  console.log('message posted', args);
};

export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    let internalPiwik: undefined | Record<string, unknown>;
    let internal_paq: undefined | unknown[] | _PaqProxy;

    console.log('hello');
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
          sendMessage('JSTC_LOADED');
          internal_paq = value;
          const originalPush = value.push;
          value.push = (args) => {
            sendMessage(args);
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
          internal_paq.forEach((p) => sendMessage(p));
        }
        internalPiwik = value;
      },
      get: function () {
        return internalPiwik;
      },
    });
  },
});
