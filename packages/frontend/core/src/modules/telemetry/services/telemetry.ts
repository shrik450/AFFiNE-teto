// NO-OP STUB: Telemetry service replaced with no-op for privacy

import { OnEvent, Service } from '@toeverything/infra';

import type { GlobalContextService } from '../../global-context';
import type { ServersService } from '../../cloud';
import { ApplicationStarted } from '../../lifecycle';

@OnEvent(ApplicationStarted, e => e.onApplicationStart)
export class TelemetryService extends Service {
  constructor(
    private readonly globalContextService: GlobalContextService,
    private readonly serversService: ServersService
  ) {
    super();
    // No-op: All telemetry removed for privacy
  }

  onApplicationStart() {
    // No-op: No telemetry to initialize
  }

  registerMiddlewares() {
    // No-op: No middlewares to register
  }

  extractGlobalContext(): { page?: string; serverId?: string } {
    // No-op: Return empty context
    return {};
  }

  override dispose(): void {
    super.dispose();
  }
}
