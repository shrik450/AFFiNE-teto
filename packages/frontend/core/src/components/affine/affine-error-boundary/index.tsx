// NO-OP STUB: Replaced Sentry ErrorBoundary with React ErrorBoundary for privacy

import type { FC, PropsWithChildren } from 'react';
import { Component, useCallback } from 'react';

import { AffineErrorFallback } from './affine-error-fallback';

export { type FallbackProps } from './error-basic/fallback-creator';

export interface AffineErrorBoundaryProps extends PropsWithChildren {
  height?: number | string;
  className?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// React ErrorBoundary implementation (no Sentry reporting)
class ReactErrorBoundary extends Component<
  {
    fallback: (props: {
      error: Error;
      componentStack: string | null;
      resetError: () => void;
    }) => React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    children: React.ReactNode;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        componentStack: this.state.errorInfo?.componentStack || null,
        resetError: this.resetError,
      });
    }

    return this.props.children;
  }
}

/**
 * TODO(@eyhn): Unify with SWRErrorBoundary
 */
export const AffineErrorBoundary: FC<AffineErrorBoundaryProps> = props => {
  const fallbackRender = useCallback(
    (fallbackProps: {
      error: Error;
      componentStack: string | null;
      resetError: () => void;
    }) => {
      return (
        <AffineErrorFallback
          {...fallbackProps}
          height={props.height}
          className={props.className}
        />
      );
    },
    [props.height, props.className]
  );

  const onError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Uncaught error:', error, errorInfo.componentStack);
    // No Sentry reporting - error is only logged to console
  }, []);

  return (
    <ReactErrorBoundary fallback={fallbackRender} onError={onError}>
      {props.children}
    </ReactErrorBoundary>
  );
};
