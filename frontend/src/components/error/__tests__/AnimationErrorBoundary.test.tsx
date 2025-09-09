import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnimationErrorBoundary } from '../AnimationErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Animation error');
  }
  return <div>Animation working</div>;
};

describe('AnimationErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error and console.warn for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={false} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Animation working')).toBeInTheDocument();
  });

  it('renders default fallback when animation fails', () => {
    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Contenido no disponible')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom animation fallback</div>;

    render(
      <AnimationErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(screen.getByText('Custom animation fallback')).toBeInTheDocument();
    expect(screen.queryByText('Contenido no disponible')).not.toBeInTheDocument();
  });

  it('logs warning when animation error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'warn');

    render(
      <AnimationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnimationErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Animation component error:', 'Animation error');
  });
});