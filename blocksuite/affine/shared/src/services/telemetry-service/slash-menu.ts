// NO-OP STUB: Slash menu telemetry events replaced with empty types for privacy

import type { TelemetryEvent } from './types.js';

export type SlashMenuEventType = string;

export type SlashMenuEvents = Record<SlashMenuEventType, TelemetryEvent>;
