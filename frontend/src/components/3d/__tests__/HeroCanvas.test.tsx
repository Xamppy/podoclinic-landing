import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { HeroCanvas } from '../HeroCanvas';

// Mock WebGL detection
jest.mock('../../../lib/webgl', () => ({
  useReducedMotion: jest.fn(() => false),
  hasMinimumWebGLCapabilities: jest.fn(() => false),
}));

// Mock performance utilities
jest.mock('../../../lib/performance', () => ({
  useAdaptiveQuality: jest.fn(() => ({
    fps: 60,
    qualityLevel: 'high',
    recommendations: {
      pixelRatio: 2,
      antialias: true,
      shadowMapEnabled: true,
      maxLights: 4,
      particleCount: 100,
      geometryDetail: 1.0,
      animationQuality: 1.0,
    },
    averageFPS: 60,
  })),
  PerformanceMonitor: {
    getInstance: jest.fn(() => ({
      measureFrame: jest.fn(() => 60),
      getAverageFPS: jest.fn(() => 60),
      reset: jest.fn(),
    })),
  },
}));

// Mock window.matchMedia for reduced motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('HeroCanvas', () => {
  const mockWebGL = require('../../../lib/webgl');
  const mockPerformance = require('../../../lib/performance');

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebGL.useReducedMotion.mockReturnValue(false);
    
    // Reset window global
    delete (window as any).__heroCanvasRetry;
  });

  afterEach(() => {
    // Clean up any global state
    delete (window as any).__heroCanvasRetry;
  });

  describe('Rendering States', () => {
    it('should show loading state initially on server side', () => {
      // Mock server-side rendering
      const originalWindow = global.window;
      delete (global as any).window;

      render(<HeroCanvas />);

      expect(screen.getByText('Cargando experiencia 3D...')).toBeInTheDocument();

      // Restore window
      global.window = originalWindow;
    });

    it('should render Enhanced3DBackground when client-side and motion enabled', async () => {
      mockWebGL.useReducedMotion.mockReturnValue(false);

      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should show the enhanced background with animated elements
        const animatedElements = container.querySelectorAll('[style*="transform"]');
        expect(animatedElements.length).toBeGreaterThan(0);
      });
    });

    it('should render StaticBackground when reduced motion is preferred', async () => {
      mockWebGL.useReducedMotion.mockReturnValue(true);

      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should show static background without animations
        const staticBackground = container.querySelector('.bg-gradient-to-br');
        expect(staticBackground).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(<HeroCanvas className="custom-class" />);
      
      const canvasContainer = container.querySelector('.custom-class');
      expect(canvasContainer).toBeInTheDocument();
    });
  });

  describe('Scroll Integration', () => {
    it('should respond to scrollY prop changes', async () => {
      const { container, rerender } = render(<HeroCanvas scrollY={0} />);

      await waitFor(() => {
        const elements = container.querySelectorAll('[style*="translateY"]');
        expect(elements.length).toBeGreaterThan(0);
      });

      // Change scroll position
      rerender(<HeroCanvas scrollY={100} />);

      await waitFor(() => {
        const elements = container.querySelectorAll('[style*="translateY"]');
        // Elements should have different transform values
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should handle scroll events when scrollY prop is not provided', async () => {
      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        const elements = container.querySelectorAll('[style*="translateY"]');
        expect(elements.length).toBeGreaterThan(0);
      });

      // Simulate scroll event
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
        fireEvent.scroll(window);
      });

      await waitFor(() => {
        const elements = container.querySelectorAll('[style*="translateY"]');
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mouse Interaction', () => {
    it('should respond to mouse movement for parallax effects', async () => {
      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        const canvasContainer = container.firstChild as HTMLElement;
        expect(canvasContainer).toBeInTheDocument();
      });

      const canvasContainer = container.firstChild as HTMLElement;

      // Simulate mouse move
      act(() => {
        fireEvent.mouseMove(canvasContainer, {
          clientX: 100,
          clientY: 50,
        });
      });

      await waitFor(() => {
        const elements = container.querySelectorAll('[style*="translateX"]');
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('should expose retry function to global window', async () => {
      render(<HeroCanvas />);

      await waitFor(() => {
        expect((window as any).__heroCanvasRetry).toBeDefined();
        expect(typeof (window as any).__heroCanvasRetry).toBe('function');
      });
    });

    it('should clean up retry function on unmount', async () => {
      const { unmount } = render(<HeroCanvas />);

      await waitFor(() => {
        expect((window as any).__heroCanvasRetry).toBeDefined();
      });

      unmount();

      expect((window as any).__heroCanvasRetry).toBeUndefined();
    });

    it('should handle retry function call', async () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(<HeroCanvas />);

      await waitFor(() => {
        expect((window as any).__heroCanvasRetry).toBeDefined();
      });

      // Call retry function
      act(() => {
        (window as any).__heroCanvasRetry();
      });

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Performance Considerations', () => {
    it('should render geometric shapes efficiently', async () => {
      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should render 12 geometric shapes as per implementation
        const shapes = container.querySelectorAll('[style*="animate"]');
        expect(shapes.length).toBeGreaterThanOrEqual(12);
      });
    });

    it('should render floating particles', async () => {
      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should render 10 floating particles as per implementation
        const particles = container.querySelectorAll('[class*="animate-ping"]');
        expect(particles.length).toBe(10);
      });
    });

    it('should include main foot-like shape', async () => {
      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        const footShape = container.querySelector('.w-40.h-24');
        expect(footShape).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should respect reduced motion preferences', async () => {
      mockWebGL.useReducedMotion.mockReturnValue(true);

      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should not have animated elements when reduced motion is preferred
        const animatedElements = container.querySelectorAll('[class*="animate-"]');
        expect(animatedElements.length).toBe(0);
      });
    });

    it('should provide static alternative for reduced motion', async () => {
      mockWebGL.useReducedMotion.mockReturnValue(true);

      const { container } = render(<HeroCanvas />);

      await waitFor(() => {
        // Should show static background pattern
        const staticPattern = container.querySelector('[style*="background-image"]');
        expect(staticPattern).toBeInTheDocument();
      });
    });
  });
});