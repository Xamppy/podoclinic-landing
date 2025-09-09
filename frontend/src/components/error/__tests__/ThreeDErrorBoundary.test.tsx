import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThreeDErrorBoundary } from '../ThreeDErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('3D model error');
  }
  return <div>3D model working</div>;
};

describe('ThreeDErrorBoundary', () => {
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
      <ThreeDErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ThreeDErrorBoundary>
    );

    expect(screen.getByText('3D model working')).toBeInTheDocument();
  });

  it('renders default fallback when 3D model fails', () => {
    render(
      <ThreeDErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ThreeDErrorBoundary>
    );

    expect(screen.getByText('Modelo 3D no disponible')).toBeInTheDocument();
    expect(screen.getByText('El contenido interactivo no se pudo cargar, pero puedes continuar navegando.')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom 3D fallback</div>;

    render(
      <ThreeDErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ThreeDErrorBoundary>
    );

    expect(screen.getByText('Custom 3D fallback')).toBeInTheDocument();
    expect(screen.queryByText('Modelo 3D no disponible')).not.toBeInTheDocument();
  });

  it('logs warning when 3D error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'warn');

    render(
      <ThreeDErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ThreeDErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith('3D component error:', '3D model error');
  });
});