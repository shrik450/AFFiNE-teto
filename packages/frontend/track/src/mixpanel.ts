// NO-OP STUB: Mixpanel client replaced with no-op for privacy

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
