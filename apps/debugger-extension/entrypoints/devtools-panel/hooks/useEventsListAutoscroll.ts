import { ComponentRef, useEffect, useRef, useState } from 'react';
import { Filters } from '../App';
import { Entry } from '../eventStore';

export function useEventsListAutoscroll(msgs: Entry[], filters: Filters) {
  const eventListContainerRef = useRef<ComponentRef<'div'>>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  useEffect(() => {
    const container = eventListContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 10;
      setIsAutoScrollEnabled(atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoScrollEnabled) return;
    const container = eventListContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight });
    }
  }, [isAutoScrollEnabled, msgs]);

  useEffect(() => {
    const container = eventListContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight });
    }
  }, [filters]);

  return { eventListContainerRef };
}
