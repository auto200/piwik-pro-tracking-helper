import {
  ComponentRef,
  Fragment,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { XCircle } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getEventType } from '@/lib/eventDetector';
import { Header } from './components/Header';
import { Entry, eventStore } from './eventStore';
import { EventList } from './components/EventList';

export type Filters = Array<
  'PAQ_ENTRY' | 'PPAS_ENTRY' | 'PAQ_NETWORK_EVENT' | 'PPAS_NETWORK_EVENT'
>;

export function App() {
  const _msgs = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
  const [selectedMessage, setSelectedMessage] = useState<Entry | undefined>();
  const [filters, setFilters] = useState<Filters>([]);

  const containerRef = useRef<ComponentRef<'div'>>(null);
  const headerRef = useRef<ComponentRef<'div'>>(null);

  const msgs = useMemo(() => {
    if (filters.length === 0) return _msgs;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return _msgs.filter((msg) => filters.includes(msg.type));
  }, [_msgs, filters]);

  useLayoutEffect(() => {
    const abortController = new AbortController();
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' || e.key === '`') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setSelectedMessage(undefined);
        }
      },
      { signal: abortController.signal }
    );

    function handleResize() {
      if (headerRef.current && containerRef.current) {
        const headerHeight = headerRef.current.getBoundingClientRect().height;
        containerRef.current.style.height = `${window.innerHeight - headerHeight - 1}px`;
      }
    }

    window.addEventListener('resize', handleResize, { signal: abortController.signal });
    handleResize();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <Header
        ref={headerRef}
        filters={filters}
        onFiltersChange={(filters) => {
          setSelectedMessage(undefined);
          setFilters(filters);
        }}
        reset={() => {
          eventStore.clear();
          setSelectedMessage(undefined);
        }}
      />
      {/* content */}
      <PanelGroup direction="horizontal" autoSaveId="JSTC_DBG_PANELS">
        {/* left panel */}
        <Panel order={1} minSize={25}>
          <EventList
            msgs={msgs}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
          />
        </Panel>
        {/* right panel */}
        {selectedMessage && (
          <>
            <PanelResizeHandle className="basis-[0.15rem] bg-slate-400" />
            <Panel order={2}>
              <div className="h-full overflow-auto bg-slate-100 text-sm">
                <div className="sticky top-0 border-b-2 border-slate-300 bg-slate-100">
                  <Button
                    variant="ghost"
                    className="hover:bg-slate-200"
                    size="icon"
                    onClick={() => setSelectedMessage(undefined)}
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
                  {(() => {
                    switch (selectedMessage.type) {
                      case 'PAQ_ENTRY':
                      case 'PPAS_ENTRY': {
                        return (
                          <>
                            <div>
                              Event name:{' '}
                              <span className="font-bold">{selectedMessage.payload.data[0]}</span>
                            </div>
                            <div>
                              parameters:{' '}
                              {JSON.stringify(
                                selectedMessage.payload.data.slice(
                                  1,
                                  selectedMessage.payload.data.length
                                )
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
                          return (
                            <div>
                              Network event:{' '}
                              <span className="font-bold">
                                {getEventType(selectedMessage.payload.params)}
                              </span>
                              {getEventType(selectedMessage.payload.params) === 'Broken Event' &&
                                selectedMessage.payload.params.length == 0 && (
                                  <div className="mt-2 font-bold">
                                    This may be Last heartbeat ping, these are currently not
                                    supported and displayed as broken events.
                                  </div>
                                )}
                              <div className="mt-2">
                                <b>Parameters:</b>
                                <Separator />
                                {selectedMessage.payload.params.map((e, i) => (
                                  <div key={i} className="flex">
                                    <span className="font-bold text-slate-600">{e.name}: </span>
                                    <span className="ml-[1ch] break-words">
                                      {import.meta.env.CHROME
                                        ? decodeURIComponent(e.value)
                                        : e.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          return selectedMessage.payload.requestsParams.map((params, i) => (
                            <Fragment key={i}>
                              <div>
                                network event:{' '}
                                <span className="font-bold">{getEventType(params)}</span>
                                {getEventType(params) === 'Broken Event' && params.length == 0 && (
                                  <div className="mt-2 font-bold">
                                    This may be Last heartbeat ping, these are currently not
                                    supported and displayed as broken events.
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
                          ));
                        }
                      }
                      default: {
                        return null;
                      }
                    }
                  })()}
                </div>
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
