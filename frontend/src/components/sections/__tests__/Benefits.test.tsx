import React from 'react';
import { render, screen } from '@testing-library/react';
import { Benefits } from '../Benefits';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { it } from 'zod/locales';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.ComponentProps<'section'>) => <section {...props}>{children}</section>,
  },
  useInView: jest.fn(() => true), // Mock useInView to always return true for testing
}));

// Mock useCountUp hook
jest.mock('../../../hooks/useCountUp', () => ({
  useCountUp: jest.fn(() => ({
    value: '5h', // Mock return value
    start: jest.fn(),
    reset: jest.fn(),
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Clock: ({ size, ...props }: { size?: number; [key: string]: unknown }) => (
    <svg data-testid="clock-icon" width={size} height={size} {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  Package: ({ size, ...props }: { size?: number; [key: string]: unknown }) => (
    <svg data-testid="package-icon" width={size} height={size} {...props}>
      <rect x="3" y="3" width="18" height="18" />
    </svg>
  ),
  Heart: ({ size, ...props }: { size?: number; [key: string]: unknown }) => (
    <svg data-testid="heart-icon" width={size} height={size} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}));

// Mock Card component
jest.mock('../../ui/Card', () => ({
  Card: ({ children, animated, className, ...props }: { 
    children: React.ReactNode; 
    animated?: boolean; 
    className?: string; 
    [key: string]: unknown;
  }) => (
    <div data-testid="card" className={className} data-animated={animated} {...props}>
      {children}
    </div>
  ),
}));

describe('Benefits Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main heading correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText('Beneficios Comprobados')).toBeInTheDocument();
  });

  it('renders the subtitle correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText(/Más de 500 clínicas en Chile ya confían/)).toBeInTheDocument();
  });

  it('renders all three benefit cards', () => {
    render(<Benefits />);
    
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('renders correct icons for each benefit', () => {
    render(<Benefits />);
    
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('renders benefit titles correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText('Ahorra hasta 5 horas semanales')).toBeInTheDocument();
    expect(screen.getByText('Reduce pérdidas por mal inventario')).toBeInTheDocument();
    expect(screen.getByText('Mejora la satisfacción del paciente')).toBeInTheDocument();
  });

  it('renders benefit descriptions correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText(/Automatiza tareas repetitivas/)).toBeInTheDocument();
    expect(screen.getByText(/Control preciso de stock/)).toBeInTheDocument();
    expect(screen.getByText(/Recordatorios automáticos/)).toBeInTheDocument();
  });

  it('renders statistics correctly', () => {
    render(<Benefits />);
    
    // Since all mocked values return '5h', we check for multiple instances
    const statElements = screen.getAllByText('5h');
    expect(statElements).toHaveLength(3);
  });

  it('renders statistic labels correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText('semanales ahorradas')).toBeInTheDocument();
    expect(screen.getByText('reducción en pérdidas')).toBeInTheDocument();
    expect(screen.getByText('satisfacción del paciente')).toBeInTheDocument();
  });

  it('renders CTA section correctly', () => {
    render(<Benefits />);
    
    expect(screen.getByText('¿Listo para transformar tu clínica?')).toBeInTheDocument();
    expect(screen.getByText(/Únete a las clínicas que ya están optimizando/)).toBeInTheDocument();
    expect(screen.getByText('Solicita tu Demo Gratuita')).toBeInTheDocument();
  });

  it('applies correct CSS classes for responsive grid', () => {
    render(<Benefits />);
    
    const gridContainer = screen.getByText('Ahorra hasta 5 horas semanales').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('uses Card component with animated prop', () => {
    render(<Benefits />);
    
    const cards = screen.getAllByTestId('card');
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-animated', 'true');
    });
  });

  it('applies proper spacing classes', () => {
    render(<Benefits />);
    
    const gridContainer = screen.getByText('Ahorra hasta 5 horas semanales').closest('.grid');
    expect(gridContainer).toHaveClass('gap-8');
  });

  it('renders icons with correct size props', () => {
    render(<Benefits />);
    
    const clockIcon = screen.getByTestId('clock-icon');
    const packageIcon = screen.getByTestId('package-icon');
    const heartIcon = screen.getByTestId('heart-icon');
    
    expect(clockIcon).toHaveAttribute('width', '48');
    expect(packageIcon).toHaveAttribute('width', '48');
    expect(heartIcon).toHaveAttribute('width', '48');
  });

  it('has proper semantic structure', () => {
    render(<Benefits />);
    
    // Should have a section element
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    
    // Should have proper heading hierarchy
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toBeInTheDocument();
    
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements).toHaveLength(4); // 3 benefit headings + 1 CTA heading
  });

  it('renders CTA button with correct styling', () => {
    render(<Benefits />);
    
    const ctaButton = screen.getByText('Solicita tu Demo Gratuita');
    expect(ctaButton).toHaveClass('bg-[#55A05E]', 'text-white', 'px-8', 'py-3', 'rounded-lg');
  });

  it('initializes useCountUp hook for each benefit card', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCountUp } = require('../../../hooks/useCountUp');
    render(<Benefits />);
    
    // Should call useCountUp 3 times (one for each benefit)
    expect(useCountUp).toHaveBeenCalledTimes(3);
  });

  it('calls useCountUp with correct parameters for first benefit', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCountUp } = require('../../../hooks/useCountUp');
    render(<Benefits />);
    
    expect(useCountUp).toHaveBeenCalledWith({
      end: 5,
      duration: 2000,
      suffix: 'h',
      delay: 0, // First card has no delay
    });
  });

  it('calls useCountUp with staggered delays for each card', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCountUp } = require('../../../hooks/useCountUp');
    render(<Benefits />);
    
    // Check that delays are staggered (0, 200, 400)
    expect(useCountUp).toHaveBeenNthCalledWith(1, expect.objectContaining({ delay: 0 }));
    expect(useCountUp).toHaveBeenNthCalledWith(2, expect.objectContaining({ delay: 200 }));
    expect(useCountUp).toHaveBeenNthCalledWith(3, expect.objectContaining({ delay: 400 }));
  });

  it('starts count animation when component is in view', () => {
    const mockStart = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCountUp } = require('../../../hooks/useCountUp');
    useCountUp.mockReturnValue({
      value: '5h',
      start: mockStart,
      reset: jest.fn(),
    });

    render(<Benefits />);
    
    // Should call start method for animations
    expect(mockStart).toHaveBeenCalled();
  });

  it('displays animated count values from useCountUp hook', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCountUp } = require('../../../hooks/useCountUp');
    
    // Mock different return values for each call
    useCountUp
      .mockReturnValueOnce({ value: '5h', start: jest.fn(), reset: jest.fn() })
      .mockReturnValueOnce({ value: '30%', start: jest.fn(), reset: jest.fn() })
      .mockReturnValueOnce({ value: '95%', start: jest.fn(), reset: jest.fn() });

    render(<Benefits />);
    
    expect(screen.getByText('5h')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});