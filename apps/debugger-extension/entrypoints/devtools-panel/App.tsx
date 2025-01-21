import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import '@/assets/tailwind.css';
import { Separator } from '@/components/ui/separator';

export function App() {
  const [msgs, setMsgs] = useState<any[]>([]);

  useEffect(() => {
    const port = browser.runtime.connect({ name: 'devtools' });

    port.onMessage.addListener(function (msg) {
      console.log('[panel]: Message from background script:', msg);

      if (msg === 'JSTC_DBG_INIT') {
        setMsgs([]);
        return;
      }

      setMsgs((msgs) => [...msgs, JSON.stringify(msg)]);
    });
  }, []);

  return (
    <>
      {msgs.map((msg, i) => (
        <>
          <div key={i}>{msg}</div>
          <Separator />
        </>
      ))}
    </>
  );
}
