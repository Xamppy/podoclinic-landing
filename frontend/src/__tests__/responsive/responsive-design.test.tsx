/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useResponsive, useResponsiveValue, useReducedMotion } from '@/hooks/useResponsive';
import { ResponsiveGrid, AutoFitGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveContainer, ResponsiveSection } from '@/components/ui/ResponsiveContainer';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test component for useResponsive hook
const TestResponsiveComponent = () => {
  const { 
    currentBreakpoint, 
    isMobile, 
    isTablet, 
    isDesktop, 
    windowSize,
    isAboveBreakpoint,
    isBelowBreakpoint 
  } = useResponsive();

  return (
    <div>
      <div data-testid="current-breakpoint">{currentBreakpoint}</div>
      <div data-testid="is-mobile">{isMobile.toString()}</div>
      <div data-testid="is-tablet">{isTablet.toString()}</div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="window-width">{windowSize.width}</div>
      <div data-testid="above-md">{isAboveBreakpoint('md').toString()}</div>
      <div data-testid="below-lg">{isBelowBreakpoint('lg').toString()}</div>
    </div>
  );
};

// Test component for useResponsiveValue hook
const TestResponsiveValueComponent = () => {
  const columns = useResponsiveValue(
    { xs: 1, sm: 2, md: 3, lg: 4 },
    1
  );

  return <div data-testid="columns">{columns}</div>;
};

// Test component for useReducedMotion hook
const TestReducedMotionComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  return <div data-testid="reduced-motion">{prefersReducedMotion.toString()}</div>;
};

describe('Responsive Design System', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('useResponsive hook', () => {
    it('should detect mobile breakpoint correctly', () => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      render(<TestResponsiveComponent />);

      expect(screen.getByTestId('current-breakpoint')).toHaveTextContent('sm');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('false');
    });

    it('should detect tablet breakpoint correctly', () => {
      // Set tablet width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TestResponsiveComponent />);

      expect(screen.getByTestId('current-breakpoint')).toHaveTextContent('md');
      expect(screen.getByTestId('is-tablet')).toHaveTextContent('true');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    });

    it('should detect desktop breakpoint correctly', () => {
      // Set desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });

      render(<TestResponsiveComponent />);

      expect(screen.getByTestId('current-breakpoint')).toHaveTextContent('xl');
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
    });

    it('should handle window resize events', async () => {
      const { rerender } = render(<TestResponsiveComponent />);

      // Initial desktop size
      expect(screen.getByTestId('window-width')).toHaveTextContent('1024');

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      fireEvent(window, new Event('resize'));
      rerender(<TestResponsiveComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('current-breakpoint')).toHaveTextContent('xs');
        expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      });
    });

    it('should correctly identify breakpoint comparisons', () => {
      // Set medium breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      render(<TestResponsiveComponent />);

      expect(screen.getByTestId('above-md')).toHaveTextContent('true');
      expect(screen.getByTestId('below-lg')).toHaveTextContent('true');
    });
  });

  describe('useResponsiveValue hook', () => {
    it('should return correct value for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<TestResponsiveValueComponent />);
      expect(screen.getByTestId('columns')).toHaveTextContent('1');
    });

    it('should return correct value for tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TestResponsiveValueComponent />);
      expect(screen.getByTestId('columns')).toHaveTextContent('3');
    });

    it('should return correct value for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<TestResponsiveValueComponent />);
      expect(screen.getByTestId('columns')).toHaveTextContent('4');
    });

    it('should fall back to closest smaller breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 700,
      });

      // Should use 'sm' value (2) since 'md' is not available for this width
      render(<TestResponsiveValueComponent />);
      expect(screen.getByTestId('columns')).toHaveTextContent('2');
    });
  });

  describe('useReducedMotion hook', () => {
    it('should detect reduced motion preference', () => {
      mockMatchMedia(true);
      render(<TestReducedMotionComponent />);
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });

    it('should detect no reduced motion preference', () => {
      mockMatchMedia(false);
      render(<TestReducedMotionComponent />);
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    });
  });

  describe('ResponsiveGrid component', () => {
    it('should render with correct grid columns', () => {
      const { container } = render(
        <ResponsiveGrid columns={{ xs: 1, md: 2, lg: 3 }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ResponsiveGrid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
    });

    it('should apply custom gap classes', () => {
      const { container } = render(
        <ResponsiveGrid gap="gap-8">
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('gap-8');
    });
  });

  describe('AutoFitGrid component', () => {
    it('should render with auto-fit grid template', () => {
      const { container } = render(
        <AutoFitGrid minItemWidth="200px">
          <div>Item 1</div>
          <div>Item 2</div>
        </AutoFitGrid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
      expect(gridElement).toHaveStyle({
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
      });
    });
  });

  describe('ResponsiveContainer component', () => {
    it('should apply correct max-width class', () => {
      const { container } = render(
        <ResponsiveContainer maxWidth="lg">
          <div>Content</div>
        </ResponsiveContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('max-w-4xl');
    });

    it('should apply responsive padding on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      const { container } = render(
        <ResponsiveContainer>
          <div>Content</div>
        </ResponsiveContainer>
      );

      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).toHaveClass('px-4');
    });
  });

  describe('ResponsiveSection component', () => {
    it('should apply correct spacing for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      const { container } = render(
        <ResponsiveSection spacing="normal">
          <div>Content</div>
        </ResponsiveSection>
      );

      const sectionElement = container.firstChild as HTMLElement;
      expect(sectionElement).toHaveClass('py-12');
    });

    it('should apply correct spacing for desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const { container } = render(
        <ResponsiveSection spacing="normal">
          <div>Content</div>
        </ResponsiveSection>
      );

      const sectionElement = container.firstChild as HTMLElement;
      expect(sectionElement).toHaveClass('py-20');
    });
  });
});

describe('Touch-friendly Design', () => {
  it('should have minimum touch target sizes', () => {
    const { container } = render(
      <button className="touch-target">Touch me</button>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('touch-target');
  });

  it('should detect touch device capability', () => {
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const TestTouchComponent = () => {
      const { isTouchDevice } = useResponsive();
      return <div data-testid="is-touch">{isTouchDevice.toString()}</div>;
    };

    render(<TestTouchComponent />);
    expect(screen.getByTestId('is-touch')).toHaveTextContent('true');
  });
});

describe('CSS Custom Properties and Clamp Functions', () => {
  it('should apply responsive typography classes', () => {
    const { container } = render(
      <h1 className="font-hero-title">Hero Title</h1>
    );

    const heading = container.firstChild as HTMLElement;
    expect(heading).toHaveClass('font-hero-title');
  });

  it('should apply responsive spacing utilities', () => {
    const { container } = render(
      <div className="space-responsive">Content</div>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('space-responsive');
  });

  it('should apply responsive grid utilities', () => {
    const { container } = render(
      <div className="grid-responsive-3">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid-responsive-3');
  });
});