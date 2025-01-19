import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

export function App() {
  const [msgs, setMsgs] = useState<any[]>([]);

  useEffect(() => {
    const port = browser.runtime.connect({ name: 'devtools' });

    port.onMessage.addListener(function (msg) {
      console.log('[panel]: Message from background script:', msg);

      setMsgs((msgs) => [...msgs, JSON.stringify(msg)]);
    });
  }, []);

  return (
    <>
      {msgs.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </>
  );
}
