import { defineContentScript } from '#imports';
import { InternalMessage, Message } from '@/lib/messaging';
import { finder } from '@medv/finder';

// proxy object created when JSTC is loaded
type _QueueProxy = { push: (args: unknown[]) => void };

function is_queueProxy(value: unknown): value is _QueueProxy {
  return typeof value === 'object' && value !== null && 'push' in value;
}

const sendMessage = (msg: Message | InternalMessage) => {
  window.postMessage(msg, '*');
};

function formatPushArgs(args: any[]) {
  return args.map((e) => {
    if (typeof e === 'function') {
      return e.toString();
    }
    if (e instanceof Element) {
      return `Element: ${finder(e)}`;
    }
    if (e instanceof Error) {
      // https://stackoverflow.com/a/26199752
      const { fileName, lineNumber, columnNumber, message } = JSON.parse(
        JSON.stringify(e, Object.getOwnPropertyNames(e))
      );
      return {
        error: message,
        location: `${fileName}:${lineNumber}:${columnNumber}`,
      };
    }
    return e;
  }) as any;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    sendMessage({
      source: 'JSTC_DBG',
      type: 'PAGE_METADATA',
      payload: { origin: location.origin },
    });
    function registerQueueListener({
      queueName,
      loadedEventType,
      messageEventType,
      objectName,
    }: {
      queueName: '_paq' | '_ppas';
      loadedEventType: 'JSTC_LOADED_PAQ' | 'JSTC_LOADED_PPAS';
      messageEventType: 'PAQ_ENTRY' | 'PPAS_ENTRY';
      objectName: 'Piwik' | 'PPAS';
    }) {
      let internal_queue: undefined | unknown[] | _QueueProxy;

      Object.defineProperty(window, queueName, {
        configurable: true,
        enumerable: true,

        set: function (value) {
          // ignore reassignment `_paq = _paq || []`
          if (internal_queue === value) {
            return;
          }
          // initialization `_paq = []`
          if (Array.isArray(value)) {
            internal_queue = value;
            return;
          }

          if (is_queueProxy(value)) {
            sendMessage({ type: loadedEventType, source: 'JSTC_DBG' });

            internal_queue = value;
            const originalPush = value.push;
            value.push = (...args) => {
              for (const arg of args) {
                try {
                  sendMessage({
                    type: messageEventType,
                    source: 'JSTC_DBG',
                    payload: {
                      type: 'SUCCESS',
                      data: formatPushArgs(arg),
                      stack: new Error().stack,
                    },
                  });
                } catch {
                  sendMessage({
                    type: messageEventType,
                    source: 'JSTC_DBG',
                    payload: {
                      type: 'ERROR',
                      stringifiedInput: JSON.stringify(arg),
                    },
                  });
                }
              }

              originalPush(...args);
            };
            return;
          }
          console.log(`some bogus amogus value assigned to "${queueName}":`, value);

          internal_queue = value;
        },
        get: function () {
          return internal_queue;
        },
      });

      let internalObjectName: undefined | Record<string, unknown>;
      // JSTC initialization
      Object.defineProperty(window, objectName, {
        configurable: true,
        enumerable: true,

        // First thing that JSTC does after loading and processing the queue is setting global
        // Piwik/PPAS object, when that object is defined we are sure that JSTC has loaded
        set: function (value) {
          internalObjectName = value;

          if (!Array.isArray(internal_queue)) return;
          // process the queued up items in native array (not proxy object) that were stored before
          // JSTC loaded
          internal_queue.forEach((arg: any) => {
            try {
              sendMessage({
                source: 'JSTC_DBG',
                type: messageEventType,
                payload: {
                  type: 'SUCCESS',
                  data: formatPushArgs(arg),
                  stack: new Error().stack,
                },
              });
            } catch {
              sendMessage({
                source: 'JSTC_DBG',
                type: messageEventType,
                payload: {
                  type: 'ERROR',
                  stringifiedInput: JSON.stringify(arg),
                },
              });
            }
          });
        },
        get: function () {
          return internalObjectName;
        },
      });
    }

    registerQueueListener({
      queueName: '_paq',
      loadedEventType: 'JSTC_LOADED_PAQ',
      messageEventType: 'PAQ_ENTRY',
      objectName: 'Piwik',
    });

    registerQueueListener({
      queueName: '_ppas',
      loadedEventType: 'JSTC_LOADED_PPAS',
      messageEventType: 'PPAS_ENTRY',
      objectName: 'PPAS',
    });
  },
});
