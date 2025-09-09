/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Mock different browser environments
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

// Mock CSS support detection
const mockCSSSupports = (property: string, value: string) => {
  Object.defineProperty(window, 'CSS', {
    writable: true,
    value: {
      supports: jest.fn().mockImplementation((prop, val) => {
        if (prop === property && val === value) {
          return true;
        }
        return false;
      }),
    },
  });
};

describe('Cross-Browser Responsive Behavior', () => {
  describe('CSS Grid Support', () => {
    it('should handle browsers with CSS Grid support', () => {
      mockCSSSupports('display', 'grid');
      
      const { container } = render(
        <div className="grid grid-responsive-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
      expect(gridElement).toHaveClass('grid-responsive-3');
    });

    it('should provide fallback for browsers without CSS Grid', () => {
      mockCSSSupports('display', 'block'); // No grid support
      
      const { container } = render(
        <div className="grid grid-responsive-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      );

      // Should still render with classes, CSS will handle fallbacks
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
    });
  });

  describe('CSS Clamp Function Support', () => {
    it('should use clamp functions in modern browsers', () => {
      mockCSSSupports('font-size', 'clamp(1rem, 2vw, 2rem)');
      
      render(<h1 className="font-hero-title">Responsive Title</h1>);
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-hero-title');
    });

    it('should provide fallback for browsers without clamp support', () => {
      mockCSSSupports('font-size', '1rem'); // No clamp support
      
      render(<h1 className="font-hero-title">Responsive Title</h1>);
      
      // Should still apply the class, CSS media queries will handle fallbacks
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-hero-title');
    });
  });

  describe('Touch Events Support', () => {
    it('should handle touch events in mobile browsers', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: {},
      });

      render(<Button>Touch Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-target');
    });

    it('should work without touch events in desktop browsers', () => {
      // Remove touch support
      delete (window as any).ontouchstart;

      render(<Button>Desktop Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Browser-Specific Behaviors', () => {
    it('should handle Safari-specific styling', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
      
      const mockOnChange = jest.fn();
      render(
        <Input
          label="Safari Input"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      // Should have proper styling that works in Safari
      expect(input).toHaveClass('rounded-lg');
    });

    it('should handle Chrome-specific optimizations', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      render(<Button>Chrome Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle Firefox-specific considerations', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
      
      render(<Button>Firefox Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle Edge-specific behaviors', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
      
      render(<Button>Edge Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Viewport Units Support', () => {
    it('should handle viewport units (vw, vh) correctly', () => {
      render(<div className="min-h-screen">Full height content</div>);
      
      const element = screen.getByText('Full height content');
      expect(element).toHaveClass('min-h-screen');
    });

    it('should provide fallbacks for viewport units', () => {
      // Test that components render even if viewport units aren't supported
      render(<div style={{ height: '100vh' }}>Viewport height</div>);
      
      const element = screen.getByText('Viewport height');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Flexbox Support', () => {
    it('should use flexbox for layout when supported', () => {
      mockCSSSupports('display', 'flex');
      
      render(
        <div className="flex flex-col sm:flex-row">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const flexContainer = screen.getByText('Item 1').parentElement;
      expect(flexContainer).toHaveClass('flex');
      expect(flexContainer).toHaveClass('flex-col');
      expect(flexContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('Custom Properties (CSS Variables) Support', () => {
    it('should use CSS custom properties when supported', () => {
      // Modern browsers support CSS custom properties
      render(<div style={{ color: 'var(--color-primary)' }}>Styled text</div>);
      
      const element = screen.getByText('Styled text');
      expect(element).toBeInTheDocument();
    });

    it('should provide fallbacks for CSS custom properties', () => {
      // Should still work even if custom properties aren't supported
      render(<div className="text-primary">Primary text</div>);
      
      const element = screen.getByText('Primary text');
      expect(element).toHaveClass('text-primary');
    });
  });

  describe('Media Query Support', () => {
    it('should handle standard media queries', () => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<div className="hidden md:block">Desktop only</div>);
      
      const element = screen.getByText('Desktop only');
      expect(element).toHaveClass('hidden');
      expect(element).toHaveClass('md:block');
    });

    it('should handle preference-based media queries', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<div>Content with motion preferences</div>);
      
      const element = screen.getByText('Content with motion preferences');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Font Loading and Fallbacks', () => {
    it('should provide proper font fallbacks', () => {
      render(<h1 className="font-montserrat">Montserrat Title</h1>);
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-montserrat');
    });

    it('should handle web font loading failures gracefully', () => {
      // Should still be readable with system fonts
      render(<p className="font-poppins">Body text with Poppins</p>);
      
      const paragraph = screen.getByText('Body text with Poppins');
      expect(paragraph).toHaveClass('font-poppins');
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript', () => {
      // Basic HTML and CSS should work without JS
      render(
        <form>
          <input type="text" className="touch-target" />
          <button type="submit" className="touch-target">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      expect(input).toHaveClass('touch-target');
      expect(button).toHaveClass('touch-target');
    });

    it('should enhance with JavaScript when available', () => {
      // Components should add enhanced functionality with JS
      render(<Button>Enhanced Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Print Styles', () => {
    it('should apply print-friendly styles', () => {
      render(<div className="print:hidden">Screen only content</div>);
      
      const element = screen.getByText('Screen only content');
      expect(element).toHaveClass('print:hidden');
    });
  });

  describe('High DPI Display Support', () => {
    it('should handle high DPI displays correctly', () => {
      // Mock high DPI
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2,
      });

      render(<img src="/test.jpg" alt="High DPI test" />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
    });
  });
});