import { defineContentScript } from 'wxt/sandbox';

// proxy object created when JSTC is loaded
type _PaqProxy = { push: (args: unknown[]) => void };

let internalPiwik: undefined | Record<string, unknown>;
let internal_paq: undefined | unknown[] | _PaqProxy;

function is_paqProxy(value: unknown): value is _PaqProxy {
  return typeof value === 'object' && value !== null && 'push' in value;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
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
          internal_paq = value;
          const originalPush = value.push;
          value.push = (args) => {
            // TODO: forward message to debugger
            // sendMessage(args);
            console.log(args);
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
        console.log('set called');
        if (Array.isArray(internal_paq)) {
          // TODO: send message that JSTC has been initialized
          // window._paq.forEach((p) => sendMessage(p));
          internal_paq?.forEach((p) => console.log(p));
        }
        internalPiwik = value;
      },
      get: function () {
        return internalPiwik;
      },
    });
  },
});
