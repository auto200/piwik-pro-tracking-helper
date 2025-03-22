import {
  ComponentRef,
  Fragment,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { ArrowRight, ArrowUpDown, XCircle } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getEventType } from '@/lib/eventDetector';
import { Message } from '@/lib/messaging';
import { cn } from '@/lib/utils';
import { Header } from './components/Header';
import { eventStore } from './eventStore';

type Entry = Message & { id: string };

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
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-100">
                <TableRow>
                  <TableHead>Event name</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {msgs.map((msg, i) => {
                  switch (msg.type) {
                    case 'JSTC_LOADED_PAQ': {
                      return (
                        <TableRow key={i}>
                          <TableCell colSpan={2} className="font-semibold text-green-600">
                            JSTC LOADED (_paq)
                          </TableCell>
                        </TableRow>
                      );
                    }
                    case 'JSTC_LOADED_PPAS': {
                      return (
                        <TableRow key={i}>
                          <TableCell colSpan={2} className="font-semibold text-purple-600">
                            JSTC LOADED (_ppas)
                          </TableCell>
                        </TableRow>
                      );
                    }
                    case 'PAQ_NETWORK_EVENT':
                    case 'PPAS_NETWORK_EVENT': {
                      return (
                        <TableRow
                          key={i}
                          onClick={() => setSelectedMessage(msg)}
                          className={cn('cursor-default', {
                            'bg-slate-300 hover:bg-slate-300': selectedMessage?.id === msg.id,
                          })}
                        >
                          <TableCell className="flex items-center gap-1">
                            <span>
                              <ArrowUpDown
                                className={
                                  msg.type === 'PAQ_NETWORK_EVENT'
                                    ? 'text-green-700'
                                    : 'text-purple-500'
                                }
                                size={18}
                              />
                            </span>
                            {msg.type === 'PAQ_NETWORK_EVENT' ? '_paq ' : '_ppas'}
                            {msg.payload.type === 'BATCH' ? (
                              msg.payload.requestsParams.map((params, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    getEventType(params) === 'Broken Event' &&
                                      'font-bold text-red-600'
                                  )}
                                >
                                  {getEventType(params)}
                                </span>
                              ))
                            ) : (
                              <span
                                className={cn(
                                  getEventType(msg.payload.params) === 'Broken Event' &&
                                    'font-bold text-red-600'
                                )}
                              >
                                {getEventType(msg.payload.params)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{msg.payload.url}</TableCell>
                        </TableRow>
                      );
                    }
                    case 'PAQ_ENTRY':
                    case 'PPAS_ENTRY': {
                      const params = msg.payload.data.slice(1, msg.payload.data.length);
                      return (
                        <TableRow
                          key={i}
                          onClick={() => setSelectedMessage(msg)}
                          className={cn('cursor-default', {
                            'bg-slate-300 hover:bg-slate-300': selectedMessage?.id === msg.id,
                          })}

                          // onClick={() => {
                          //   browser.devtools.panels.openResource(
                          //     'chrome-extension://lheofohbkhphjehlmohenmocgcojbalm/content-scripts/collector.js',
                          //     67,
                          //     44
                          //   );
                          // }}
                        >
                          <TableCell className="flex items-center gap-1">
                            <span>
                              <ArrowRight
                                className={`${msg.type === 'PAQ_ENTRY' ? 'text-green-300' : 'text-purple-400'} opacity-80`}
                                size={18}
                              />
                            </span>
                            {msg.type === 'PAQ_ENTRY' ? '[_paq] ' : '[_ppas] '}
                            <span>{msg.payload.data[0]}</span>
                          </TableCell>
                          <TableCell>
                            {params.length === 0 ? '-' : JSON.stringify(params)}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    case 'PAGE_METADATA': {
                      return;
                    }
                    default: {
                      // @ts-expect-error dummy check for now
                      throw new Error(`unhandled event ${msg.type}`);
                    }
                  }
                })}
              </TableBody>
            </Table>
          </div>
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
