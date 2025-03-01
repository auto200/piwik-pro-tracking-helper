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
import { ArrowRight, ArrowUpDown, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      <Button variant="outline" onClick={() => setMsgs([])}>
        <CircleX />
        <span>reset</span>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event name</TableHead>
            <TableHead>Payload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {msgs.map((msg, i) => {
            switch (msg.type) {
              case 'JSTC_LOADED': {
                return (
                  <TableRow key={i}>
                    <TableCell colSpan={2} className="font-semibold text-purple-500">
                      JSTC LOADED
                    </TableCell>
                  </TableRow>
                );
              }
              case 'NETWORK_EVENT': {
                const eventType = getEventType(msg.payload.params);
                return (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-1">
                      <span>
                        <ArrowUpDown className="text-blue-300" size={18} />
                      </span>{' '}
                      <span
                        className={cn(eventType === 'Broken Event' && 'font-bold text-red-600')}
                      >
                        {eventType}
                      </span>
                    </TableCell>
                    <TableCell>{msg.payload.url}</TableCell>
                  </TableRow>
                );
              }
              case 'PAQ_ENTRY': {
                const params = msg.payload.data.slice(1, msg.payload.data.length);
                return (
                  <TableRow key={i}>
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
    </>
  );
}
