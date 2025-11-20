type Middleware = (
  name: string,
  properties?: Record<string, unknown>
) => Record<string, unknown>;

function createMixpanel() {
  return {
    init() {},
    register(_props: Record<string, unknown>) {},
    reset() {},
    track(_event_name: string, _properties?: Record<string, any>) {},
    middleware(_cb: Middleware): () => void {
      return () => {};
    },
    opt_out_tracking() {},
    opt_in_tracking() {},
    has_opted_in_tracking() {},
    has_opted_out_tracking() {},
    identify(_unique_id?: string) {},
    get people() {
      return { set: (_props: Record<string, unknown>) => {} };
    },
    track_pageview(_properties?: { location?: string }) {},
  };
}

export const mixpanel = createMixpanel();
