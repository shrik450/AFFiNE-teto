// NO-OP STUB: AI action tracker replaced with no-op for privacy
// All AI action tracking has been removed

import { AIProvider } from './ai-provider';

export function setupTracker() {
  // No-op: AI action tracking is disabled
  AIProvider.slots.requestUpgradePlan.subscribe(() => {
    // No tracking
  });

  AIProvider.slots.requestLogin.subscribe(() => {
    // No tracking
  });

  AIProvider.slots.actions.subscribe(() => {
    // No tracking
  });
}
