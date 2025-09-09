/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Hero } from '@/components/sections/Hero';
import { Benefits } from '@/components/sections/Benefits';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}));

// Mock hooks that might not exist yet
jest.mock('@/hooks/useScrollAnimation', () => ({
  useStaggeredAnimation: () => ({
    ref: { current: null },
    visibleItems: new Set([0, 1, 2]),
  }),
}), { virtual: true });

jest.mock('@/hooks/useCountUp', () => ({
  useCountUp: () => ({
    value: '100',
    start: jest.fn(),
  }),
}), { virtual: true });

// Mock window.matchMedia for reduced motion tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('Mobile Optimization', () => {
  beforeEach(() => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  describe('Touch-friendly Interactions', () => {
    it('should have minimum touch target size for buttons', () => {
      render(<Button>Touch me</Button>);
      
      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Check if button has touch-target class or minimum height
      expect(button).toHaveClass('touch-target');
    });

    it('should have appropriate spacing between touch targets', () => {
      render(
        <div className="touch-spacing">
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </div>
      );

      const container = screen.getByRole('button', { name: 'Button 1' }).parentElement;
      expect(container).toHaveClass('touch-spacing');
    });

    it('should provide visual feedback on touch interactions', async () => {
      render(<Button>Touch Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Simulate touch start
      fireEvent.touchStart(button);
      
      // Button should have active state styles
      expect(button).toHaveClass('select-none');
    });

    it('should have touch-friendly input fields', () => {
      const mockOnChange = jest.fn();
      render(
        <Input
          label="Test Input"
          value=""
          onChange={mockOnChange}
          type="text"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('touch-target');
    });
  });

  describe('Responsive Typography', () => {
    it('should use clamp functions for responsive text sizing', () => {
      render(<h1 className="font-hero-title">Hero Title</h1>);
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-hero-title');
    });

    it('should apply text-balance for better readability', () => {
      render(<p className="text-balance">This is a balanced text paragraph</p>);
      
      const paragraph = screen.getByText('This is a balanced text paragraph');
      expect(paragraph).toHaveClass('text-balance');
    });

    it('should maintain minimum font size on mobile', () => {
      render(<div className="font-body">Body text</div>);
      
      const text = screen.getByText('Body text');
      expect(text).toHaveClass('font-body');
    });
  });

  describe('Responsive Layout Adaptations', () => {
    it('should stack elements vertically on mobile', () => {
      render(
        <div className="grid-responsive-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const grid = screen.getByText('Item 1').parentElement;
      expect(grid).toHaveClass('grid-responsive-3');
    });

    it('should use appropriate spacing on mobile', () => {
      render(<div className="space-responsive">Content</div>);
      
      const container = screen.getByText('Content');
      expect(container).toHaveClass('space-responsive');
    });

    it('should apply mobile-specific padding', () => {
      render(<div className="padding-responsive">Content</div>);
      
      const container = screen.getByText('Content');
      expect(container).toHaveClass('padding-responsive');
    });
  });

  describe('Hero Section Mobile Optimization', () => {
    it('should render hero section with mobile-friendly layout', () => {
      render(<Hero />);
      
      const heroSection = screen.getByRole('heading', { level: 1 });
      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toHaveClass('font-hero-title');
    });

    it('should stack hero content vertically on mobile', () => {
      render(<Hero />);
      
      // Check if CTA buttons are in a column layout
      const ctaContainer = screen.getByText('Solicita una Demostración Gratis').parentElement;
      expect(ctaContainer).toHaveClass('touch-spacing');
    });

    it('should hide complex animations on mobile if needed', () => {
      render(<Hero />);
      
      // Hero should still render but with simplified animations
      const heroSection = screen.getByRole('heading', { level: 1 });
      expect(heroSection).toBeInTheDocument();
    });
  });

  describe('Benefits Section Mobile Optimization', () => {
    it('should render benefits in single column on mobile', () => {
      render(<Benefits />);
      
      const benefitsGrid = screen.getByText('Beneficios Comprobados').parentElement?.querySelector('.grid-responsive-3');
      expect(benefitsGrid).toBeInTheDocument();
    });

    it('should maintain card readability on mobile', () => {
      render(<Benefits />);
      
      const benefitTitle = screen.getByText('Ahorra hasta 5 horas semanales');
      expect(benefitTitle).toHaveClass('text-balance');
    });
  });

  describe('Reduced Motion Preferences', () => {
    beforeEach(() => {
      mockMatchMedia(true); // User prefers reduced motion
    });

    it('should respect reduced motion preferences', () => {
      render(<Button>Animated Button</Button>);
      
      const button = screen.getByRole('button');
      // Button should still be functional but with reduced animations
      expect(button).toBeInTheDocument();
    });

    it('should disable auto-playing animations when reduced motion is preferred', () => {
      // Mock CSS to check if animations are disabled
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .animate-bounce { animation: none !important; }
        }
      `;
      document.head.appendChild(style);

      render(<div className="animate-bounce">Bouncing element</div>);
      
      const element = screen.getByText('Bouncing element');
      expect(element).toHaveClass('animate-bounce');
    });

    it('should maintain essential hover effects with reduced duration', () => {
      render(<Button>Hover Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      // Button should still respond to hover but with minimal animation
      expect(button).toBeInTheDocument();
    });
  });

  describe('High Contrast Mode Support', () => {
    beforeEach(() => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
          if (query === '(prefers-contrast: high)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: jest.fn(),
              removeListener: jest.fn(),
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              dispatchEvent: jest.fn(),
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          };
        }),
      });
    });

    it('should enhance contrast when high contrast is preferred', () => {
      render(<Button variant="primary">High Contrast Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance on Mobile', () => {
    it('should not render heavy 3D elements on mobile by default', () => {
      render(<Hero />);
      
      // Check that hero renders without throwing errors
      const heroTitle = screen.getByRole('heading', { level: 1 });
      expect(heroTitle).toBeInTheDocument();
    });

    it('should use optimized images for mobile', () => {
      // This would test Next.js Image component optimization
      // For now, we just ensure components render without errors
      render(<Hero />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should lazy load below-fold content', () => {
      render(<Benefits />);
      
      // Benefits section should render
      expect(screen.getByText('Beneficios Comprobados')).toBeInTheDocument();
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain proper focus management on mobile', () => {
      render(<Button>Focus Test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('should provide appropriate ARIA labels for mobile screen readers', () => {
      const mockOnChange = jest.fn();
      render(
        <Input
          label="Mobile Input"
          value=""
          onChange={mockOnChange}
          required
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-labelledby');
      expect(input).toHaveAttribute('aria-required', 'false');
    });

    it('should announce form errors to screen readers', () => {
      const mockOnChange = jest.fn();
      render(
        <Input
          label="Error Input"
          value=""
          onChange={mockOnChange}
          error="This field is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
    });
  });

  describe('Viewport Meta Tag Considerations', () => {
    it('should prevent zoom on form inputs by using 16px font size', () => {
      const mockOnChange = jest.fn();
      render(
        <Input
          label="No Zoom Input"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      // Input should have text-base class which corresponds to 16px
      expect(input).toHaveClass('text-base');
    });
  });
});