// NO-OP STUB: Telemetry bootstrap replaced with no-op for privacy
// All telemetry initialization has been removed

import { mixpanel, sentry } from '@affine/track';

// No-op: Telemetry is disabled
mixpanel.init();
sentry.init();

// No telemetry settings check needed - everything is already a no-op
