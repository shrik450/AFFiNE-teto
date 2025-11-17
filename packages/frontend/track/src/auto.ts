// NO-OP STUB: Auto-tracking replaced with no-op for privacy

export type { CallableEventsChain, EventsUnion } from './types';

export function makeTracker(_trackFn: any): any {
  return new Proxy({} as any, {
    get() {
      return new Proxy(() => {}, {
        get: (_, prop) => {
          if (prop === '$$typeof') return undefined;
          return makeTracker(_trackFn);
        },
        apply: () => {},
      });
    },
  });
}

export function enableAutoTrack(
  _root: HTMLElement,
  _trackFn: any
): () => void {
  return () => {};
}
