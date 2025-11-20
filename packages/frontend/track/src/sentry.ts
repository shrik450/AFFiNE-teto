import type { ComponentType, ReactNode } from 'react';

function createSentry() {
  return {
    init() {},
    enable() {},
    disable() {},
  };
}

export const sentry = createSentry();

export const captureException = (
  _error: unknown,
  _context?: Record<string, unknown>
) => {};

export const logger = {
  error: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  info: (..._args: unknown[]) => {},
  log: (..._args: unknown[]) => {},
};

export const wrapCreateBrowserRouterV6 = <T>(createRouter: T): T =>
  createRouter;

export const withSentryReactRouterV7Routing = <T extends ComponentType<any>>(
  Routes: T
): T => Routes;

export type FallbackRender = (props: {
  error: Error;
  componentStack?: string;
  resetError: () => void;
}) => ReactNode;
