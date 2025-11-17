// NO-OP STUB: Link telemetry events replaced with empty types for privacy

import type { LinkEvent } from './types.js';

export type LinkEventType = string;

export type LinkToolbarEvents = Record<LinkEventType, LinkEvent>;
