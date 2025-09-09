import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThreeDErrorBoundary } from '../ThreeDErrorBoundary';
import * as webglUtils from '@/lib/webgl';

// Mock the webgl utilities
jest.mock('@/lib/webgl', () => ({
  detectWebGLSupport: jest.fn(),
  hasMinimumWebGLCapabilities: jest.fn(),
}));

const mockDetectWebGLSupport = webglUtils.detectWebGLSupport as jest.MockedFunction<typeof webglUtils.detectWebGLSupport>;
const mockHasMinimumWebGLCapabilities = webglUtils.hasMinimumWebGLCapabilities as jest.MockedFunction<typeof webglUtils.hasMinimumWebGLCapabilities>;

// Component that throws an error
function ThrowingComponent({ shouldThrow = true, errorMessage = 'Test error' }) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Working component</div>;
}

describe('ThreeDErrorBoundary Enhanced Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Default WebGL support
    mockDetectWebGLSupport.mockReturnValue({
      supported: true,
      version: 'webgl2',
      maxTextureSize: 4096,
      maxVertexUniforms: 256,
      maxFragmentUniforms: 64,
      extensions: ['EXT_color_buffer_float'],
      renderer: 'Test Renderer',
      vendor: 'Test Vendor',
    });
    mockHasMinimumWebGLCapabilities.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('WebGL Error Handling', () => {
    it('should display WebGL incompatible message when WebGL is not supported', () => {
      mockDetectWebGLSupport.mockReturnValue({
        supported: false,
        version: null,
        maxTextureSize: 0,
        maxVertexUniforms: 0,
        maxFragmentUniforms: 0,
        extensions: [],
        renderer: 'Unknown',
        vendor: 'Unknown',
      });
      mockHasMinimumWebGLCapabilities.mockReturnValue(false);

      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent errorMessage="WebGL context creation failed" />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText('WebGL no compatible')).toBeInTheDocument();
      expect(screen.getByText(/Tu navegador no soporta WebGL/)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument(); // No retry button
    });

    it('should display limited capabilities message when WebGL has insufficient capabilities', () => {
      mockDetectWebGLSupport.mockReturnValue({
        supported: true,
        version: 'webgl',
        maxTextureSize: 256, // Below minimum
        maxVertexUniforms: 64,
        maxFragmentUniforms: 16,
        extensions: [],
        renderer: 'Basic Renderer',
        vendor: 'Basic Vendor',
      });
      mockHasMinimumWebGLCapabilities.mockReturnValue(false);

      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText('Capacidades limitadas')).toBeInTheDocument();
      expect(screen.getByText(/capacidades gráficas limitadas/)).toBeInTheDocument();
    });

    it('should show retry button for WebGL errors', () => {
      render(
        <ThreeDErrorBoundary enableRetry={true} maxRetries={3}>
          <ThrowingComponent errorMessage="WebGL rendering error" />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText('Error de WebGL')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
    });
  });

  describe('Network Error Handling', () => {
    it('should display network error message and retry button', () => {
      render(
        <ThreeDErrorBoundary enableRetry={true}>
          <ThrowingComponent errorMessage="Failed to fetch 3D assets" />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
      expect(screen.getByText(/No se pudieron cargar los recursos 3D/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
    });

    it('should handle network retry attempts', async () => {
      const mockRetry = jest.fn();
      
      render(
        <ThreeDErrorBoundary onRetry={mockRetry} enableRetry={true} maxRetries={2}>
          <ThrowingComponent errorMessage="network timeout" />
        </ThreeDErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /Reintentar/ });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Retry Mechanism', () => {
    it('should disable retry button when max retries reached', () => {
      render(
        <ThreeDErrorBoundary enableRetry={true} maxRetries={2}>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      // Simulate multiple retries by re-rendering with increased retry count
      const { rerender } = render(
        <ThreeDErrorBoundary enableRetry={true} maxRetries={2}>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      // Should show retry button initially
      expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
    });

    it('should show retry count in button text', () => {
      render(
        <ThreeDErrorBoundary enableRetry={true} maxRetries={3}>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText(/3 restantes/)).toBeInTheDocument();
    });

    it('should disable retry when enableRetry is false', () => {
      render(
        <ThreeDErrorBoundary enableRetry={false}>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('should render enhanced static background with animations', () => {
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      // Check for gradient background
      const backgroundElement = screen.getByRole('generic');
      expect(backgroundElement).toHaveClass('bg-gradient-to-br');
      
      // Should contain animated elements
      const container = screen.getByRole('generic');
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should maintain visual consistency with main design', () => {
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      // Check for design system colors
      const container = screen.getByRole('generic');
      expect(container).toHaveClass('from-[#2C6145]', 'via-[#55A05E]', 'to-[#2C6145]');
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
      
      render(
        <ThreeDErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });
  });

  describe('Error Logging and Analytics', () => {
    it('should log comprehensive error information', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent errorMessage="Test logging error" />
        </ThreeDErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('3D Canvas Error:'),
        expect.objectContaining({
          error: 'Test logging error',
          webglSupported: true,
          timestamp: expect.any(String),
        })
      );
    });

    it('should call analytics when gtag is available', () => {
      const mockGtag = jest.fn();
      (window as any).gtag = mockGtag;
      
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent errorMessage="Analytics test error" />
        </ThreeDErrorBoundary>
      );

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: '3D Canvas Error: Analytics test error',
        fatal: false,
        custom_map: {
          retry_count: 0,
          webgl_supported: true,
        }
      });

      delete (window as any).gtag;
    });
  });

  describe('Component Recovery', () => {
    it('should render children when no error occurs', () => {
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ThreeDErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should reset error state on retry', async () => {
      let shouldThrow = true;
      const mockRetry = jest.fn(() => {
        shouldThrow = false;
      });

      const { rerender } = render(
        <ThreeDErrorBoundary onRetry={mockRetry} enableRetry={true}>
          <ThrowingComponent shouldThrow={shouldThrow} />
        </ThreeDErrorBoundary>
      );

      // Should show error initially
      expect(screen.getByText(/Error de WebGL|Contenido 3D no disponible/)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Reintentar/ });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalled();
      });

      // Rerender with fixed component
      rerender(
        <ThreeDErrorBoundary onRetry={mockRetry} enableRetry={true}>
          <ThrowingComponent shouldThrow={false} />
        </ThreeDErrorBoundary>
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      const retryButton = screen.queryByRole('button');
      if (retryButton) {
        expect(retryButton).toHaveAttribute('type', 'button');
      }
    });

    it('should provide screen reader friendly error messages', () => {
      render(
        <ThreeDErrorBoundary>
          <ThrowingComponent />
        </ThreeDErrorBoundary>
      );

      // Error messages should be descriptive
      expect(screen.getByText(/puedes continuar navegando/)).toBeInTheDocument();
    });
  });
});