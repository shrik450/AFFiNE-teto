import { enableAutoTrack, makeTracker } from './auto';
import { type EventArgs, type Events } from './events';
import { mixpanel } from './mixpanel';
import {
  captureException,
  type FallbackRender,
  logger,
  sentry,
  withSentryReactRouterV7Routing,
  wrapCreateBrowserRouterV6,
} from './sentry';
export const track = makeTracker((event, props) => {
  mixpanel.track(event, props);
});

export {
  captureException,
  enableAutoTrack,
  type EventArgs,
  type Events,
  type FallbackRender,
  logger,
  mixpanel,
  sentry,
  withSentryReactRouterV7Routing,
  wrapCreateBrowserRouterV6,
};
export default track;
