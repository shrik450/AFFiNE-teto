// NO-OP STUB: Note telemetry events replaced with empty types for privacy

import type { TelemetryEvent } from './types.js';

export type NoteEventType = string;

export type NoteEvents = Record<string, TelemetryEvent>;
