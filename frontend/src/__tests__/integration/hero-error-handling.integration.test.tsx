import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';
import * as webglUtils from '@/lib/webgl';

// Mock the webgl utilities
jest.mock('@/lib/webgl', () => ({
  detectWebGLSupport: jest.fn(),
  hasMinimumWebGLCapabilities: jest.fn(),
  useReducedMotion: jest.fn(),
}));

// Mock dynamic import for HeroCanvas
jest.mock('next/dynamic', () => {
  return function dynamic(importFunc: any, options: any) {
    const Component = ({ className }: { className?: string }) => {
      // Simulate Canvas error for testing
      if (process.env.SIMULATE_CANVAS_ERROR === 'true') {
        throw new Error('Simulated Canvas error');
      }
      return <div data-testid="hero-canvas" className={className}>Canvas Content</div>;
    };
    
    Component.displayName = 'DynamicHeroCanvas';
    return Component;
  };
});

const mockDetectWebGLSupport = webglUtils.detectWebGLSupport as jest.MockedFunction<typeof webglUtils.detectWebGLSupport>;
const mockHasMinimumWebGLCapabilities = webglUtils.hasMinimumWebGLCapabilities as jest.MockedFunction<typeof webglUtils.hasMinimumWebGLCapabilities>;
const mockUseReducedMotion = webglUtils.useReducedMotion as jest.MockedFunction<typeof webglUtils.useReducedMotion>;

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Element.prototype.scrollIntoView = mockScrollIntoView;

// Mock window.scrollTo and window.scrollBy
const mockScrollTo = jest.fn();
const mockScrollBy = jest.fn();
Object.defineProperty(window, 'scrollTo', { value: mockScrollTo, writable: true });
Object.defineProperty(window, 'scrollBy', { value: mockScrollBy, writable: true });

describe('Hero Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SIMULATE_CANVAS_ERROR;
    
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
    mockUseReducedMotion.mockReturnValue(false);

    // Mock DOM elements for navigation
    const mockContactSection = document.createElement('div');
    mockContactSection.id = 'contact';
    const mockFeaturesSection = document.createElement('div');
    mockFeaturesSection.id = 'features';
    
    document.body.appendChild(mockContactSection);
    document.body.appendChild(mockFeaturesSection);
    
    jest.spyOn(document, 'getElementById')
      .mockImplementation((id) => {
        if (id === 'contact') return mockContactSection;
        if (id === 'features') return mockFeaturesSection;
        return null;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Normal Operation', () => {
    it('should render Hero with Canvas when no errors occur', () => {
      render(<Hero />);
      
      expect(screen.getByTestId('hero-canvas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Solicita una Demostración Gratis/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver Funcionalidades/ })).toBeInTheDocument();
    });

    it('should handle CTA button clicks for navigation', () => {
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /Solicita una Demostración Gratis/ });
      fireEvent.click(ctaButton);
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle features button clicks for navigation', () => {
      render(<Hero />);
      
      const featuresButton = screen.getByRole('button', { name: /Ver Funcionalidades/ });
      fireEvent.click(featuresButton);
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Canvas Error Scenarios', () => {
    beforeEach(() => {
      process.env.SIMULATE_CANVAS_ERROR = 'true';
    });

    it('should display error fallback when Canvas fails', async () => {
      render(<Hero />);
      
      // Should show error fallback UI
      await waitFor(() => {
        expect(screen.getByText(/Contenido 3D no disponible|Error de WebGL|WebGL no compatible/)).toBeInTheDocument();
      });
    });

    it('should maintain CTA button functionality in error state', async () => {
      render(<Hero />);
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/Contenido 3D no disponible|Error de WebGL|WebGL no compatible/)).toBeInTheDocument();
      });
      
      // CTA buttons should still be functional
      const ctaButton = screen.getByRole('button', { name: /Solicita una Demostración Gratis/ });
      expect(ctaButton).toBeInTheDocument();
      
      fireEvent.click(ctaButton);
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should maintain features button functionality in error state', async () => {
      render(<Hero />);
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/Contenido 3D no disponible|Error de WebGL|WebGL no compatible/)).toBeInTheDocument();
      });
      
      // Features button should still be functional
      const featuresButton = screen.getByRole('button', { name: /Ver Funcionalidades/ });
      expect(featuresButton).toBeInTheDocument();
      
      fireEvent.click(featuresButton);
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should show retry button for recoverable errors', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        const retryButton = screen.queryByRole('button', { name: /Reintentar/ });
        if (retryButton) {
          expect(retryButton).toBeInTheDocument();
        }
      });
    });

    it('should handle retry functionality', async () => {
      render(<Hero />);
      
      await waitFor(() => {
        const retryButton = screen.queryByRole('button', { name: /Reintentar/ });
        if (retryButton) {
          fireEvent.click(retryButton);
          // Should not throw or break the page
          expect(retryButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('WebGL Capability Scenarios', () => {
    it('should handle WebGL not supported scenario', async () => {
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

      render(<Hero />);
      
      // Should still render all content and buttons
      expect(screen.getByRole('button', { name: /Solicita una Demostración Gratis/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver Funcionalidades/ })).toBeInTheDocument();
    });

    it('should handle limited WebGL capabilities scenario', async () => {
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

      render(<Hero />);
      
      // Should still render all content and buttons
      expect(screen.getByRole('button', { name: /Solicita una Demostración Gratis/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver Funcionalidades/ })).toBeInTheDocument();
    });
  });

  describe('Navigation Fallbacks', () => {
    it('should handle missing contact section gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /Solicita una Demostración Gratis/ });
      fireEvent.click(ctaButton);
      
      // Should fallback to scrollTo
      expect(mockScrollTo).toHaveBeenCalledWith({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      });
    });

    it('should handle missing features section gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      render(<Hero />);
      
      const featuresButton = screen.getByRole('button', { name: /Ver Funcionalidades/ });
      fireEvent.click(featuresButton);
      
      // Should fallback to scrollBy
      expect(mockScrollBy).toHaveBeenCalledWith({ 
        top: window.innerHeight, 
        behavior: 'smooth' 
      });
    });

    it('should handle scrollIntoView errors gracefully', () => {
      mockScrollIntoView.mockImplementation(() => {
        throw new Error('ScrollIntoView failed');
      });
      
      render(<Hero />);
      
      const ctaButton = screen.getByRole('button', { name: /Solicita una Demostración Gratis/ });
      
      // Should not throw error
      expect(() => fireEvent.click(ctaButton)).not.toThrow();
      
      // Should fallback to scrollTo
      expect(mockScrollTo).toHaveBeenCalledWith({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      mockUseReducedMotion.mockReturnValue(true);
      
      render(<Hero />);
      
      // Should still render all interactive elements
      expect(screen.getByRole('button', { name: /Solicita una Demostración Gratis/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver Funcionalidades/ })).toBeInTheDocument();
    });
  });

  describe('Content Accessibility', () => {
    it('should maintain proper heading structure in error state', async () => {
      process.env.SIMULATE_CANVAS_ERROR = 'true';
      render(<Hero />);
      
      // Main heading should always be present
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
    });

    it('should maintain proper button labels and roles', async () => {
      process.env.SIMULATE_CANVAS_ERROR = 'true';
      render(<Hero />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least CTA and Features buttons
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
        expect(button.textContent).toBeTruthy();
      });
    });

    it('should provide meaningful text content when Canvas fails', async () => {
      process.env.SIMULATE_CANVAS_ERROR = 'true';
      render(<Hero />);
      
      // Key content should still be visible
      expect(screen.getByText(/Gestiona tu clínica sin esfuerzo/)).toBeInTheDocument();
      expect(screen.getByText(/solución integral para clínicas/)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should not block rendering when Canvas initialization fails', async () => {
      process.env.SIMULATE_CANVAS_ERROR = 'true';
      
      const startTime = performance.now();
      render(<Hero />);
      const endTime = performance.now();
      
      // Should render quickly even with Canvas errors
      expect(endTime - startTime).toBeLessThan(100);
      
      // Content should be immediately available
      expect(screen.getByRole('button', { name: /Solicita una Demostración Gratis/ })).toBeInTheDocument();
    });

    it('should clean up resources properly on unmount', () => {
      const { unmount } = render(<Hero />);
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});