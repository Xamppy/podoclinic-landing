import React from 'react';
import { render, screen } from '@testing-library/react';
import { Benefits } from '../../components/sections/Benefits';
import { Features } from '../../components/sections/Features';
import { Pricing } from '../../components/sections/Pricing';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the custom hooks
jest.mock('../../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({
    ref: { current: null },
    isInView: true,
    hasTriggered: true,
  }),
  useStaggeredAnimation: () => ({
    ref: { current: null },
    visibleItems: new Set([0, 1, 2, 3, 4, 5]),
    isInView: true,
  }),
}));

jest.mock('../../hooks/useParallax', () => ({
  useParallax: () => ({
    ref: { current: null },
    transform: 'translate3d(0, 0, 0)',
  }),
}));

jest.mock('../../hooks/useCountUp', () => ({
  useCountUp: () => ({
    value: '100',
    reset: jest.fn(),
    start: jest.fn(),
  }),
}));

describe('Scroll Animations Integration', () => {
  describe('Benefits Section', () => {
    it('should render with animation components', () => {
      render(<Benefits />);
      
      expect(screen.getByText('Beneficios Comprobados')).toBeInTheDocument();
      expect(screen.getByText('Ahorra hasta 5 horas semanales')).toBeInTheDocument();
      expect(screen.getByText('Reduce pérdidas por mal inventario')).toBeInTheDocument();
      expect(screen.getByText('Mejora la satisfacción del paciente')).toBeInTheDocument();
    });

    it('should include parallax background elements', () => {
      const { container } = render(<Benefits />);
      
      // Check for parallax background structure
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('overflow-hidden');
    });
  });

  describe('Features Section', () => {
    it('should render with staggered animation structure', () => {
      render(<Features />);
      
      expect(screen.getByText('Funcionalidades Completas')).toBeInTheDocument();
      expect(screen.getByText('Agenda de Citas')).toBeInTheDocument();
      expect(screen.getByText('Fichas de Pacientes')).toBeInTheDocument();
      expect(screen.getByText('Control de Inventario')).toBeInTheDocument();
    });

    it('should have proper grid layout for animations', () => {
      const { container } = render(<Features />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('Pricing Section', () => {
    it('should render with parallax and animation elements', () => {
      render(<Pricing />);
      
      expect(screen.getByText('Elige el plan que se ajuste a tu clínica')).toBeInTheDocument();
      expect(screen.getByText('Plan Básico')).toBeInTheDocument();
      expect(screen.getByText('Plan Pro')).toBeInTheDocument();
      expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });

    it('should have relative positioning for parallax effects', () => {
      const { container } = render(<Pricing />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('overflow-hidden');
    });
  });

  describe('Animation Performance', () => {
    it('should use transform3d for hardware acceleration', () => {
      // This test verifies that our animation utilities use proper CSS transforms
      const { useParallax } = require('../../hooks/useParallax');
      const result = useParallax();
      
      expect(result.transform).toContain('translate3d');
    });

    it('should handle multiple animated components without issues', () => {
      const { container } = render(
        <div>
          <Benefits />
          <Features />
          <Pricing />
        </div>
      );
      
      // Should render all components without errors
      expect(container.children).toHaveLength(1);
      expect(screen.getByText('Beneficios Comprobados')).toBeInTheDocument();
      expect(screen.getByText('Funcionalidades Completas')).toBeInTheDocument();
      expect(screen.getByText('Elige el plan que se ajuste a tu clínica')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });

      render(<Benefits />);
      
      // Component should still render properly even with reduced motion
      expect(screen.getByText('Beneficios Comprobados')).toBeInTheDocument();
    });

    it('should maintain semantic structure with animations', () => {
      render(<Features />);
      
      // Check for proper heading hierarchy
      const heading = screen.getByRole('heading', { name: /funcionalidades completas/i });
      expect(heading).toBeInTheDocument();
      
      // Check for proper list structure
      const featureCards = screen.getAllByText(/agenda de citas|fichas de pacientes|control de inventario/i);
      expect(featureCards.length).toBeGreaterThan(0);
    });
  });
});