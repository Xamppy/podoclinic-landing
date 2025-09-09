/**
 * Integration tests for HeroCanvas with Hero section layout
 * Tests the complete integration between 3D Canvas and Hero component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Hero } from '../../components/sections/Hero';

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: () => Promise<any>) {
    const Component = React.lazy(importFunc);
    return function DynamicComponent(props: any) {
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  };
});

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock ThreeDErrorBoundary
jest.mock('../../components/error/ThreeDErrorBoundary', () => ({
  ThreeDErrorBoundary: ({ children, onRetry }: any) => (
    <div data-testid="error-boundary">
      {children}
      <button onClick={onRetry} data-testid="retry-button">Retry</button>
    </div>
  ),
}));

// Mock Button component
jest.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={`btn ${variant} ${size} ${className}`}
      data-testid={`button-${variant}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock WebGL and performance utilities
jest.mock('../../lib/webgl', () => ({
  useReducedMotion: jest.fn(() => false),
}));

jest.mock('../../lib/performance', () => ({
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
}));

// Mock window.matchMedia
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

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('HeroCanvas Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Layout Integration', () => {
    it('should render HeroCanvas as background layer with proper z-index', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();
      });

      // Check that Canvas is wrapped in error boundary
      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toBeInTheDocument();

      // Verify z-index layering structure
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');

      // Content should be positioned above Canvas
      const contentOverlay = container.querySelector('.relative.z-10');
      expect(contentOverlay).toBeInTheDocument();
    });

    it('should preserve Hero text content and layout', async () => {
      render(<Hero />);

      await waitFor(() => {
        expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
      });

      // Main heading
      expect(screen.getByText(/Sistema Podoclinic:/)).toBeInTheDocument();
      expect(screen.getByText(/Gestiona tu clínica sin esfuerzo/)).toBeInTheDocument();

      // Description
      expect(screen.getByText(/La solución integral para clínicas/)).toBeInTheDocument();

      // CTA buttons
      expect(screen.getByText('Solicita una Demostración Gratis')).toBeInTheDocument();
      expect(screen.getByText('Ver Funcionalidades')).toBeInTheDocument();

      // Benefit previews
      expect(screen.getByText('Ahorra Tiempo')).toBeInTheDocument();
      expect(screen.getByText('Evita Pérdidas')).toBeInTheDocument();
      expect(screen.getByText('Mejora tu Servicio')).toBeInTheDocument();
    });

    it('should maintain responsive grid layout', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
        expect(gridContainer).toBeInTheDocument();
      });

      // Should have proper responsive classes
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2', 'gap-12', 'items-center');
    });

    it('should render scroll indicator above all content', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const scrollIndicator = container.querySelector('.absolute.bottom-8');
        expect(scrollIndicator).toBeInTheDocument();
      });

      const scrollIndicator = container.querySelector('.absolute.bottom-8');
      expect(scrollIndicator).toHaveClass('z-20'); // Highest z-index
      expect(scrollIndicator).toHaveTextContent('Descubre más');
    });
  });

  describe('Interactive Elements', () => {
    it('should handle CTA button clicks correctly', async () => {
      // Mock getElementById to simulate contact section
      const mockContactSection = document.createElement('div');
      mockContactSection.id = 'contact';
      mockContactSection.scrollIntoView = jest.fn();
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockContactSection);

      render(<Hero />);

      await waitFor(() => {
        const ctaButton = screen.getByTestId('button-primary');
        expect(ctaButton).toBeInTheDocument();
      });

      const ctaButton = screen.getByTestId('button-primary');
      fireEvent.click(ctaButton);

      expect(document.getElementById).toHaveBeenCalledWith('contact');
      expect(mockContactSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle features button clicks correctly', async () => {
      // Mock getElementById to simulate features section
      const mockFeaturesSection = document.createElement('div');
      mockFeaturesSection.id = 'features';
      mockFeaturesSection.scrollIntoView = jest.fn();
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockFeaturesSection);

      render(<Hero />);

      await waitFor(() => {
        const featuresButton = screen.getByTestId('button-secondary');
        expect(featuresButton).toBeInTheDocument();
      });

      const featuresButton = screen.getByTestId('button-secondary');
      fireEvent.click(featuresButton);

      expect(document.getElementById).toHaveBeenCalledWith('features');
      expect(mockFeaturesSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle navigation fallbacks gracefully', async () => {
      // Mock getElementById to return null (section not found)
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      // Mock window.scrollTo
      const mockScrollTo = jest.fn();
      Object.defineProperty(window, 'scrollTo', { value: mockScrollTo });

      render(<Hero />);

      await waitFor(() => {
        const ctaButton = screen.getByTestId('button-primary');
        expect(ctaButton).toBeInTheDocument();
      });

      const ctaButton = screen.getByTestId('button-primary');
      fireEvent.click(ctaButton);

      // Should fallback to scrolling to bottom
      expect(mockScrollTo).toHaveBeenCalledWith({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should integrate with ThreeDErrorBoundary correctly', async () => {
      render(<Hero />);

      await waitFor(() => {
        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();
      });

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle Canvas retry functionality', async () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(<Hero />);

      await waitFor(() => {
        const retryButton = screen.getByTestId('retry-button');
        expect(retryButton).toBeInTheDocument();
      });

      // Wait for Canvas to set up retry function
      await waitFor(() => {
        expect((window as any).__heroCanvasRetry).toBeDefined();
      });

      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      expect(mockReload).toHaveBeenCalled();
    });

    it('should maintain functionality when Canvas fails', async () => {
      // Simulate Canvas error by not setting up retry function
      render(<Hero />);

      await waitFor(() => {
        // Text content should still be available
        expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
      });

      // Buttons should still work
      const ctaButton = screen.getByTestId('button-primary');
      expect(ctaButton).toBeInTheDocument();
      
      // Should not throw when clicking
      expect(() => fireEvent.click(ctaButton)).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    it('should load Canvas dynamically without blocking Hero render', async () => {
      const { container } = render(<Hero />);

      // Hero content should render immediately
      expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();

      // Canvas should load asynchronously
      await waitFor(() => {
        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();
      });
    });

    it('should show loading fallback during Canvas load', async () => {
      const { container } = render(<Hero />);

      // Should show static background during load
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();

      // Dynamic import loading state should be handled
      await waitFor(() => {
        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain keyboard navigation with Canvas overlay', async () => {
      render(<Hero />);

      await waitFor(() => {
        const ctaButton = screen.getByTestId('button-primary');
        expect(ctaButton).toBeInTheDocument();
      });

      // Buttons should be focusable
      const ctaButton = screen.getByTestId('button-primary');
      const featuresButton = screen.getByTestId('button-secondary');

      ctaButton.focus();
      expect(document.activeElement).toBe(ctaButton);

      // Tab navigation should work
      fireEvent.keyDown(ctaButton, { key: 'Tab' });
      // Note: jsdom doesn't handle tab navigation automatically, 
      // but we can verify elements are focusable
      expect(featuresButton).toBeInTheDocument();
    });

    it('should respect reduced motion preferences in integrated layout', async () => {
      const mockWebGL = require('../../lib/webgl');
      mockWebGL.useReducedMotion.mockReturnValue(true);

      render(<Hero />);

      await waitFor(() => {
        const errorBoundary = screen.getByTestId('error-boundary');
        expect(errorBoundary).toBeInTheDocument();
      });

      // Content should still be accessible
      expect(screen.getByText(/Sistema Podoclinic/)).toBeInTheDocument();
      expect(screen.getByTestId('button-primary')).toBeInTheDocument();
    });

    it('should maintain proper heading hierarchy', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const mainHeading = container.querySelector('h1');
        expect(mainHeading).toBeInTheDocument();
      });

      const mainHeading = container.querySelector('h1');
      expect(mainHeading).toHaveTextContent(/Sistema Podoclinic/);

      // Benefit section headings should be h3
      const benefitHeadings = container.querySelectorAll('h3');
      expect(benefitHeadings.length).toBe(3);
      expect(benefitHeadings[0]).toHaveTextContent('Ahorra Tiempo');
      expect(benefitHeadings[1]).toHaveTextContent('Evita Pérdidas');
      expect(benefitHeadings[2]).toHaveTextContent('Mejora tu Servicio');
    });
  });

  describe('Responsive Integration', () => {
    it('should handle mobile layout with Canvas', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });

      const { container } = render(<Hero />);

      await waitFor(() => {
        const gridContainer = container.querySelector('.grid');
        expect(gridContainer).toBeInTheDocument();
      });

      // Should use mobile-first responsive classes
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');

      // Text should be centered on mobile
      const textContainer = container.querySelector('.text-center.lg\\:text-left');
      expect(textContainer).toBeInTheDocument();
    });

    it('should handle desktop layout with Canvas interaction space', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1920 });
      Object.defineProperty(window, 'innerHeight', { value: 1080 });

      const { container } = render(<Hero />);

      await waitFor(() => {
        const interactionSpace = container.querySelector('.hidden.lg\\:block');
        expect(interactionSpace).toBeInTheDocument();
      });

      // Should have space for 3D interaction on desktop
      const interactionSpace = container.querySelector('.hidden.lg\\:block.relative.h-96');
      expect(interactionSpace).toBeInTheDocument();
    });
  });

  describe('Content Overlay Integration', () => {
    it('should maintain proper text contrast over Canvas', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const textElements = container.querySelectorAll('.text-white');
        expect(textElements.length).toBeGreaterThan(0);
      });

      // Text should have proper contrast classes
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-white', 'drop-shadow-lg');

      const description = container.querySelector('p');
      expect(description).toHaveClass('text-gray-100', 'drop-shadow-md');
    });

    it('should maintain benefit cards visibility over Canvas', async () => {
      const { container } = render(<Hero />);

      await waitFor(() => {
        const benefitCards = container.querySelectorAll('.bg-white\\/20');
        expect(benefitCards.length).toBe(3);
      });

      // Benefit icons should have proper backdrop
      const benefitIcons = container.querySelectorAll('.bg-white\\/20.backdrop-blur-sm');
      expect(benefitIcons.length).toBe(3);

      benefitIcons.forEach(icon => {
        expect(icon).toHaveClass('shadow-lg');
      });
    });
  });
});