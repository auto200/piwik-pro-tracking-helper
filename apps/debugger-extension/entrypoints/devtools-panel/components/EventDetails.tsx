import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getEventType } from '@/lib/eventDetector';
import { XCircle } from 'lucide-react';
import { Fragment } from 'react';
import { Entry } from '../eventStore';

type EventDetailsProps = {
  selectedMessage: Entry;
  onClose: () => void;
};

export function EventDetails({ selectedMessage, onClose }: EventDetailsProps) {
  return (
    <div className="h-full overflow-auto bg-slate-100 text-sm">
      <div className="sticky top-0 border-b-2 border-slate-300 bg-slate-100">
        <Button variant="ghost" className="hover:bg-slate-200" size="icon" onClick={onClose}>
          <XCircle />
        </Button>
      </div>

      <div className="p-2">
        {(selectedMessage.type === 'PAQ_NETWORK_EVENT' ||
          selectedMessage.type === 'PPAS_NETWORK_EVENT') &&
          selectedMessage.payload.type === 'BATCH' && (
            <div className="my-3 font-bold">
              <p>Batch of events</p>
              <p>Count: {selectedMessage.payload.requestsParams.length}</p>
            </div>
          )}
        <EventDetail selectedMessage={selectedMessage} />
      </div>
    </div>
  );
}

type EventDetailProps = {
  selectedMessage: Entry;
};
function EventDetail({ selectedMessage }: EventDetailProps) {
  switch (selectedMessage.type) {
    case 'PAQ_ENTRY':
    case 'PPAS_ENTRY': {
      return (
        <>
          <div>
            Event name: <span className="font-bold">{selectedMessage.payload.data[0]}</span>
          </div>
          <div>
            parameters:{' '}
            {JSON.stringify(
              selectedMessage.payload.data.slice(1, selectedMessage.payload.data.length)
            )}
          </div>
          <div className="mt-2">
            <div className="font-bold">What triggered this event?</div>
            <pre>
              {selectedMessage.payload.stack
                ?.split('\n')
                .slice(1, selectedMessage.payload.stack.split('\n').length)
                .filter((l) => !l.includes('chrome-extension'))
                .join('\n')}
            </pre>
          </div>
        </>
      );
    }
    case 'PAQ_NETWORK_EVENT':
    case 'PPAS_NETWORK_EVENT': {
      if (selectedMessage.payload.type === 'SINGLE') {
        const eventType = getEventType(selectedMessage.payload.params);
        return (
          <div>
            Network event: <span className="font-bold">{eventType}</span>
            {eventType === 'Broken Event' && selectedMessage.payload.params.length == 0 && (
              <div className="mt-2 font-bold">
                This may be Last heartbeat ping, these are currently not supported and displayed as
                broken events.
              </div>
            )}
            <div className="mt-2">
              <b>Parameters:</b>
              <Separator />
              {selectedMessage.payload.params.map((e, i) => (
                <div key={i} className="flex">
                  <span className="font-bold text-slate-600">{e.name}: </span>
                  <span className="ml-[1ch] break-words">
                    {import.meta.env.CHROME ? decodeURIComponent(e.value) : e.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        return selectedMessage.payload.requestsParams.map((params, i) => {
          const eventType = getEventType(params);
          return (
            <Fragment key={i}>
              <div>
                network event: <span className="font-bold">{eventType}</span>
                {eventType === 'Broken Event' && params.length == 0 && (
                  <div className="mt-2 font-bold">
                    This may be Last heartbeat ping, these are currently not supported and displayed
                    as broken events.
                  </div>
                )}
                <div>
                  {params.map((e, i) => (
                    <div key={i}>
                      {e.name}: <span className="font-bold">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="my-3" />
            </Fragment>
          );
        });
      }
    }
    default: {
      return null;
    }
  }
}
