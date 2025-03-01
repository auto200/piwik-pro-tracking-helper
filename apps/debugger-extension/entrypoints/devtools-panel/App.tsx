import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import '@/assets/tailwind.css';
import { Message } from '@/lib/messaging';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getEventType } from '@/lib/eventDetector';
import { ArrowRight, ArrowUpDown } from 'lucide-react';

export function App() {
  const [msgs, setMsgs] = useState<Message[]>([]);

  useEffect(() => {
    const port = browser.runtime.connect({ name: 'devtools' });

    port.onMessage.addListener(function (msg) {
      console.log('[panel]: Message from background script:', msg);

      setMsgs((msgs) => [...msgs, msg as Message]);
    });
  }, []);

  return (
    <>
      <button onClick={() => setMsgs([])}>reset</button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event name</TableHead>
            <TableHead>Payload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {msgs.map((msg) => {
            switch (msg.type) {
              case 'JSTC_LOADED': {
                return (
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold text-red-400">
                      JSTC LOADED
                    </TableCell>
                  </TableRow>
                );
              }
              case 'NETWORK_EVENT': {
                return (
                  <TableRow>
                    <TableCell className="flex items-center gap-1">
                      <span>
                        <ArrowUpDown className="text-blue-300" size={18} />
                      </span>{' '}
                      <span>{getEventType(msg.payload.params)}</span>
                    </TableCell>
                    <TableCell>{msg.payload.url}</TableCell>
                  </TableRow>
                );
              }
              case 'PAQ_ENTRY': {
                const params = msg.payload.data.slice(1, msg.payload.data.length);
                return (
                  <TableRow>
                    <TableCell className="flex items-center gap-1">
                      <span>
                        <ArrowRight className="text-green-300 opacity-80" size={18} />
                      </span>{' '}
                      <span>{msg.payload.data[0]}</span>
                    </TableCell>
                    <TableCell>{params.length === 0 ? '-' : JSON.stringify(params)}</TableCell>
                  </TableRow>
                );
              }
              default: {
                // @ts-expect-error dummy check for now
                throw new Error(`unhandled event ${msg.type}`);
              }
            }
          })}
        </TableBody>
      </Table>
      {/* {msgs.map((msg, i) =>
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
      )} */}
    </>
  );
}
