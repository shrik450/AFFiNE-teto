// NO-OP STUB: Citation telemetry events replaced with empty types for privacy

import type { TelemetryEvent } from './types';

export type CitationEventType = string;

export type CitationEvents = Record<CitationEventType, TelemetryEvent>;
