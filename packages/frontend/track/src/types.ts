// NO-OP STUB: Type definitions replaced with minimal stubs for privacy

import type { EventArgs, Events } from './events';

type EventPropsOverride = {
  page?: keyof Events;
  segment?: string;
  module?: string;
  control?: string;
};

// Simplified stub - accepts any property chain
export type CallableEventsChain = any;

export type EventsUnion = string;

export interface EventProps {
  // location
  page?: keyof Events;
  segment?: string;
  module?: string;
  control?: string;
  arg?: string;

  // entity
  type?: string;
  category?: string;
  id?: string;
}

// Keep React module augmentation for compatibility
declare module 'react' {
  interface HTMLAttributes<T> {
    'data-event-props'?: EventsUnion;
    'data-event-arg'?: string;
    'data-event-args-control'?: string;
  }
}
