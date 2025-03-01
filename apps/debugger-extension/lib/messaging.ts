import { QueryParam } from './types';

export type Message =
  | { type: 'PAQ_ENTRY'; source: 'JSTC_DBG'; payload: { data: [string, ...unknown[]] } }
  | {
      type: 'NETWORK_EVENT';
      source: 'JSTC_DBG';
      payload: { url: string; params: QueryParam[] };
    }
  | {
      type: 'JSTC_LOADED';
      source: 'JSTC_DBG';
    };
