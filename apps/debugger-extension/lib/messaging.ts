import { QueryParam } from './types';

export type Message =
  | {
      type: 'PAQ_ENTRY' | 'PPAS_ENTRY';
      source: 'JSTC_DBG';
      payload: { data: [string, ...unknown[]]; stack: string | undefined };
    }
  | {
      type: 'PAQ_NETWORK_EVENT' | 'PPAS_NETWORK_EVENT';
      source: 'JSTC_DBG';
      payload: { url: string; params: QueryParam[] };
    }
  | {
      type: 'JSTC_LOADED_PAQ' | 'JSTC_LOADED_PPAS';
      source: 'JSTC_DBG';
    };
