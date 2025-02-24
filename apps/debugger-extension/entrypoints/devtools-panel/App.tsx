import { Fragment, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import '@/assets/tailwind.css';
import { Separator } from '@/components/ui/separator';

export function App() {
  const [msgs, setMsgs] = useState<any[]>([]);

  useEffect(() => {
    const port = browser.runtime.connect({ name: 'devtools' });

    port.onMessage.addListener(function (msg) {
      console.log('[panel]: Message from background script:', msg);

      // if (msg === 'JSTC_DBG_INIT') {
      //   setMsgs([]);
      //   return;
      // }

      setMsgs((msgs) => [...msgs, JSON.stringify(msg)]);
    });
  }, []);

  return (
    <>
      <button onClick={() => setMsgs([])}>reset</button>
      {msgs.map((msg, i) =>
        (msg as string).includes('JSTC_LOADED') ? (
          <div
            key={i}
            className="my-3"
            title="Events until this point have been queued up and waiting for the JSTC to load to be processed"
          >
            <div className="font-bold text-red-400">JSTC LOADED</div>
            <Separator className="bg-red-200" />
          </div>
        ) : (
          <Fragment key={i}>
            <div>{msg}</div>
            <Separator />
          </Fragment>
        )
      )}
    </>
  );
}
