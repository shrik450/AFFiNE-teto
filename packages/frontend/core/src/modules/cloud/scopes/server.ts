import { Scope } from '@toeverything/infra';

import type { Server } from '../entities/server';

export class ServerScope extends Scope<{ server: Server }> {
  get server() {
    return this.props.server;
  }
}
