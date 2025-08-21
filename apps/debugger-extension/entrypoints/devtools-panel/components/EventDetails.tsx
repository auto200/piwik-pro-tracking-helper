import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getEventType } from '@/lib/eventDetector';
import { XCircle } from 'lucide-react';
import { Fragment } from 'react';
import { Entry } from '../eventStore';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PARAMETER_DESCRIPTION, type ParameterName } from '../data/parameterDescription';
import { QueryParam } from '@/lib/types';

type EventDetailsProps = {
  selectedMessage: Entry;
  onClose: () => void;
};

export function EventDetails({ selectedMessage, onClose }: EventDetailsProps) {
  const { theme } = useTheme();
  return (
    <div className={cn('h-full overflow-auto text-sm', theme === 'light' && 'bg-slate-100')}>
      <div
        className={cn(
          'sticky top-0 border-b-2 border-slate-300',
          theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'
        )}
      >
        <Button
          variant="ghost"
          className={theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-600'}
          size="icon"
          onClick={onClose}
        >
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
      if (selectedMessage.payload.type === 'ERROR') {
        return (
          <>
            <div className="font-bold">Invalid input</div>
            <div>Expected:</div>
            <div className="ml-2">
              <Badge>
                {selectedMessage.type === 'PAQ_ENTRY' ? '_paq' : '_ppas'}
                .push([&quot;methodName&quot;, ...parameters])
              </Badge>
            </div>

            <div>or</div>

            <div className="ml-2">
              <Badge>
                {selectedMessage.type === 'PAQ_ENTRY' ? '_paq' : '_ppas'}
                {'.push([function(){...}])'}
              </Badge>
            </div>

            <div>Received:</div>

            <div className="ml-2">
              <Badge className="bg-red-300">{selectedMessage.payload.stringifiedInput}</Badge>
            </div>

            <div className="mt-2">
              <a
                className="text-blue-400 underline"
                href="https://developers.piwik.pro/docs/plain-javascript-browser-js-api#methods-used-for-calls"
              >
                Piwik PRO Documentation
              </a>
            </div>
          </>
        );
      }

      return (
        <>
          <div>
            Event name: <span className="font-bold">{selectedMessage.payload.data[0]}</span>
          </div>
          <div>
            parameters:{' '}
            <span className="font-bold">
              {JSON.stringify(
                selectedMessage.payload.data.slice(1, selectedMessage.payload.data.length)
              )}
            </span>
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
        return <NetworkEvent eventParams={selectedMessage.payload.params} />;
      } else {
        return selectedMessage.payload.requestsParams.map((params, i) => {
          return (
            <Fragment key={i}>
              <NetworkEvent eventParams={params} />
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

function NetworkEvent({ eventParams }: { eventParams: QueryParam[] }) {
  const { theme } = useTheme();

  const eventType = getEventType(eventParams);

  return (
    <div>
      Network event: <span className="font-bold">{eventType}</span>
      {eventType === 'Broken Event' && eventParams.length == 0 && (
        <div className="mt-2 font-bold">
          This may be Last heartbeat ping, these are currently not supported and displayed as broken
          events.
        </div>
      )}
      <div className="mt-2">
        <b>Parameters:</b>
        <Separator />
        {eventParams.map((e, i) => (
          <div key={i} className="flex">
            <span
              className={cn('font-bold', theme === 'light' ? 'text-slate-600' : 'text-slate-400')}
              title={
                PARAMETER_DESCRIPTION[e.name as ParameterName] ||
                (e.name.startsWith('dimension') && PARAMETER_DESCRIPTION['dimensionID']) ||
                ''
              }
            >
              {e.name}:{' '}
            </span>
            <span className="ml-[1ch] break-words">
              {import.meta.env.CHROME ? decodeURIComponent(e.value) : e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
