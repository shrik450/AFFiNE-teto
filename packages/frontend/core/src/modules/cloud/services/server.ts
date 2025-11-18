import { Service } from '@toeverything/infra';

import type { ServerScope } from '../scopes/server';

export class ServerService extends Service {
  get server() {
    return this.serverScope.server;
  }
  constructor(private readonly serverScope: ServerScope) {
    super();
  }
}
