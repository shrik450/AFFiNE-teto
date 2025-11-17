// NO-OP STUB: Database telemetry events replaced with empty types for privacy

export type WithParams<Map, T> = { [K in keyof Map]: Map[K] & T };

export type DatabaseParams = {
  blockId?: string;
};

// Simplified event types - all no-op
export type DatabaseViewEvents = Record<string, any>;
export type DatabasePropertyEvents = Record<string, any>;
export type DatabaseFilterEvents = Record<string, any>;
export type DatabaseGroupEvents = Record<string, any>;
export type DatabaseEvents = Record<string, any>;
export type DatabaseAllSortEvents = Record<string, any>;
export type DatabaseAllViewEvents = Record<string, any>;
export type DatabaseAllEvents = Record<string, any>;
export type OutDatabaseAllEvents = Record<string, any>;

export type EventTraceFn<Events> = <K extends keyof Events>(
  key: K,
  params: Events[K]
) => void;
