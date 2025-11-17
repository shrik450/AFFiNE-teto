// NO-OP STUB: Code block telemetry events replaced with empty types for privacy

import type { TelemetryEvent } from './types.js';

export type CodeBlockEventType = string;

export type CodeBlockEvents = Record<CodeBlockEventType, TelemetryEvent>;
