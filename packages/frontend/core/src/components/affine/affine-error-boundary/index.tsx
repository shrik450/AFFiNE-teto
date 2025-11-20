import { type FallbackRender } from '@affine/track';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Component, useCallback } from 'react';

import { AffineErrorFallback } from './affine-error-fallback';

export { type FallbackProps } from './error-basic/fallback-creator';

export interface AffineErrorBoundaryProps extends PropsWithChildren {
  height?: number | string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ReactErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: FallbackRender;
    onError?: (error: Error, componentStack?: string) => void;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo.componentStack ?? undefined);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      });
    }
    return this.props.children;
  }
}

export const AffineErrorBoundary: FC<AffineErrorBoundaryProps> = props => {
  const fallbackRender: FallbackRender = useCallback(
    fallbackProps => {
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

  const onError = useCallback((error: unknown, componentStack?: string) => {
    console.error('Uncaught error:', error, componentStack);
  }, []);

  return (
    <ReactErrorBoundary fallback={fallbackRender} onError={onError}>
      {props.children}
    </ReactErrorBoundary>
  );
};
