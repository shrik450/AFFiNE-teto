// NO-OP STUB: All telemetry functions replaced with no-ops for privacy

export type { EventArgs, Events } from './events';
export type { CallableEventsChain, EventProps, EventsUnion } from './types';

// No-op track function - creates a proxy that accepts any method chain
export const track = new Proxy({} as any, {
  get() {
    return new Proxy(() => {}, {
      get: () => track,
      apply: () => {},
    });
  },
});

// No-op enableAutoTrack
export function enableAutoTrack(_root: HTMLElement, _trackFn: any): () => void {
  return () => {};
}

// No-op mixpanel client
export const mixpanel = {
  init: () => {},
  register: (_props: any) => {},
  reset: () => {},
  track: (_event_name: string, _properties?: Record<string, any>) => {},
  middleware: (_cb: any) => () => {},
  opt_out_tracking: () => {},
  opt_in_tracking: () => {},
  has_opted_in_tracking: () => {},
  has_opted_out_tracking: () => {},
  identify: (_unique_id?: string) => {},
  people: new Proxy({} as any, {
    get: () => () => {},
  }),
  track_pageview: (_properties?: any) => {},
};

// No-op sentry client
export const sentry = {
  init: () => {},
  enable: () => {},
  disable: () => {},
};

export default track;
